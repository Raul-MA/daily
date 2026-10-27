import { test, expect } from '@playwright/test';
import { prepare } from './fixtures.js';

async function openHome(page, options = {}) {
  const calls = await prepare(page, { handle: async (route, url) => {
    if (!url.pathname.includes('/review/')) return false;
    await route.fulfill({ status: 404, json: { detail: 'Review not found.' } });
    return true;
  }, ...options });
  await page.getByRole('link', { name: 'Home', exact: true }).click();
  await expect(page.locator('.daily-read')).toHaveCount(3);
  return calls;
}

test('dashboard Reader chooses configured reads once per local day and exposes Pick again without opening an app', async ({ page }) => {
  await page.clock.install({ time: new Date(2026, 9, 27, 12) });
  await openHome(page);
  const widget = page.locator('[data-reading-reader]');
  await expect(widget.getByRole('heading', { name: 'Today’s reads' })).toBeVisible();
  await expect(widget.getByRole('link', { name: 'Open in Reader', exact: true })).toHaveCount(3);
  await expect(widget.locator('.reading-detail').first()).toContainText('min remaining');
  const selection = () => page.evaluate(() => JSON.parse(localStorage.getItem('daily:v1')).modules.reading.data.picks);
  const first = await selection();
  await page.reload();
  await expect(widget.locator('.daily-read')).toHaveCount(3);
  expect(await selection()).toEqual(first);
  await page.clock.setSystemTime(new Date(2026, 9, 27, 13));
  await widget.getByRole('button', { name: 'Pick again', exact: true }).click();
  await expect.poll(async () => (await selection()).selectedAt).toBeGreaterThan(first.selectedAt);
  const again = await selection();
  await page.clock.setSystemTime(new Date(2026, 9, 28, 0, 1));
  await page.reload();
  await expect.poll(async () => (await selection()).selectedAt).toBeGreaterThan(again.selectedAt);
  await expect(page).toHaveURL(/#\/$/);
});

test('dashboard Reader failures keep saved reads and offer explicit retry without a request loop', async ({ page }) => {
  await openHome(page);
  await page.route('https://readwise.io/api/v3/list/**', route => route.fulfill({ status: 500, json: { detail: 'Unavailable' } }));
  await page.evaluate(() => {
    const root = JSON.parse(localStorage.getItem('daily:v1'));
    root.modules.reading.data.picks.selectedAt -= 86400000;
    localStorage.setItem('daily:v1', JSON.stringify(root));
    sessionStorage.removeItem('daily:readwise:reader-cache:v1');
  });
  await page.reload();
  const widget = page.locator('[data-reading-reader]');
  await expect(widget.getByRole('alert')).toContainText('500');
  await expect(widget.locator('.daily-read')).toHaveCount(3);
  await expect(widget.getByRole('heading', { name: 'Previous reads' })).toBeVisible();
  await expect(widget.getByRole('button', { name: 'Pick again', exact: true })).toBeEnabled();
});

test('dashboard reading hierarchy wraps at phone and desktop widths with clear title and detail sizes', async ({ page }, testInfo) => {
  await openHome(page);
  await page.evaluate(() => {
    const root = JSON.parse(localStorage.getItem('daily:v1'));
    for (const document of root.modules.reading.data.picks.documents) {
      document.title = 'A long reading title about building a considered daily reading habit';
      document.author = 'A thoughtful author';
      document.site_name = 'Reading journal';
    }
    localStorage.setItem('daily:v1', JSON.stringify(root));
  });
  await page.reload();
  for (const width of [320, 390, 1280]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    const sizes = await page.locator('.daily-read').first().evaluate(node => ({
      title: Number.parseFloat(getComputedStyle(node.querySelector('h3')).fontSize),
      detail: Number.parseFloat(getComputedStyle(node.querySelector('.reading-detail')).fontSize),
      weight: Number(getComputedStyle(node.querySelector('h3')).fontWeight),
    }));
    expect(sizes.title).toBeGreaterThan(sizes.detail);
    expect(sizes.weight).toBeGreaterThanOrEqual(700);
    await page.screenshot({ path: testInfo.outputPath(`reading-dashboard-${width}.png`), fullPage: true });
  }
});

test('dashboard Reader uses saved count time and locations and keeps its selection through language changes', async ({ page }) => {
  await prepare(page);
  await page.goto('./#/reading/settings');
  await page.locator('#reader-default-count').fill('1');
  await page.locator('#reader-default-minutes').fill('3');
  await page.locator('#locationNew').uncheck();
  await page.locator('#locationShortlist').uncheck();
  await page.getByRole('button', { name: 'Save Reader preferences', exact: true }).click();
  await page.getByRole('link', { name: 'Home', exact: true }).click();
  const widget = page.locator('[data-reading-reader]');
  await expect(widget.locator('.daily-read')).toHaveCount(1);
  await expect(widget).toContainText('Started three');
  const before = await page.evaluate(() => JSON.parse(localStorage.getItem('daily:v1')).modules.reading.data);
  await page.getByRole('button', { name: 'Español', exact: true }).click();
  await expect(widget.getByRole('button', { name: 'Elegir de nuevo', exact: true })).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('daily:v1')).modules.reading.data)).toEqual(before);
});
