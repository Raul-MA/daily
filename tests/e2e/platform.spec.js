import { test, expect } from '@playwright/test';

const home = page => page.goto('/daily/#/');

async function settings(page) {
  await page.getByRole('link', { name: 'Settings', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Settings', exact: true })).toBeVisible();
}

test('dashboard keeps the accepted three, two and one column layouts', async ({ page }, testInfo) => {
  await home(page);
  await expect(page.getByRole('heading', { name: 'Today', exact: true })).toBeVisible();
  await expect(page.locator('[data-widget]')).toHaveCount(6);
  for (const [width, columns] of [[1280, 3], [1100, 3], [900, 2], [390, 1], [320, 1]]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.locator('#dashboard').evaluate(node => getComputedStyle(node).gridTemplateColumns.split(' ').length)).toBe(columns);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (width === 1280 || width === 390) await page.screenshot({ path: testInfo.outputPath(`home-${width}.png`), fullPage: true });
  }
  await expect(page.locator('#dashboard button')).toHaveCount(0);
});

test('all modules stay reachable and dashboard navigation creates no records', async ({ page }) => {
  await home(page);
  await page.evaluate(() => localStorage.setItem('unrelated-app', 'preserve'));
  const before = await page.evaluate(() => ({ ...localStorage }));
  await page.getByText('Apps', { exact: true }).click();
  await expect(page.getByRole('navigation', { name: 'Apps' }).getByRole('link')).toHaveCount(7);
  await page.getByRole('navigation', { name: 'Apps' }).getByRole('link', { name: 'Coffee', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Coffee', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Home', exact: true }).click();
  await page.getByRole('link', { name: 'Log coffee', exact: true }).click();
  await expect(page).toHaveURL(/#\/coffee\/new$/);
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Today', exact: true })).toBeVisible();
  expect(await page.evaluate(() => ({ ...localStorage }))).toEqual(before);
});

test('shared language setting persists and leaves module user text unchanged', async ({ page }) => {
  await home(page);
  await page.getByRole('button', { name: 'English', exact: true }).click();
  await page.evaluate(() => {
    const document = JSON.parse(localStorage.getItem('daily:v1'));
    document.modules.plants = { version: 1, data: { name: 'My 🌱 fern' } };
    localStorage.setItem('daily:v1', JSON.stringify(document));
  });
  await page.getByRole('button', { name: 'Español', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await expect(page.getByRole('heading', { name: 'Hoy', exact: true })).toBeVisible();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('daily:v1')).modules.plants.data.name)).toBe('My 🌱 fern');
});

test('widget visibility and order persist without removing apps or module state', async ({ page }) => {
  await home(page);
  await settings(page);
  await page.getByRole('checkbox', { name: 'Plants', exact: true }).uncheck();
  await page.getByRole('button', { name: 'Move Running down', exact: true }).click();
  await page.getByRole('link', { name: 'Home', exact: true }).click();
  await expect(page.locator('[data-widget="plants"]')).toHaveCount(0);
  await expect(page.locator('[data-widget]').first()).toHaveAttribute('data-widget', 'review');
  await page.reload();
  await expect(page.locator('[data-widget="plants"]')).toHaveCount(0);
  await page.getByText('Apps', { exact: true }).click();
  await expect(page.getByRole('navigation', { name: 'Apps' }).getByRole('link', { name: 'Plants', exact: true })).toBeVisible();
});

test('quick-action visibility persists while its app remains in the menu', async ({ page }) => {
  await home(page);
  await settings(page);
  await page.getByRole('checkbox', { name: 'Log coffee', exact: true }).uncheck();
  await page.getByRole('link', { name: 'Home', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Log coffee', exact: true })).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('link', { name: 'Log coffee', exact: true })).toHaveCount(0);
  await page.getByText('Apps', { exact: true }).click();
  await expect(page.getByRole('navigation', { name: 'Apps' }).getByRole('link', { name: 'Coffee', exact: true })).toBeVisible();
});

test('stable deep links reload and unknown routes provide an accessible way home', async ({ page }) => {
  await page.goto('/daily/#/plants/plant%20%F0%9F%8C%B1');
  await expect(page.locator('[data-route-id]')).toHaveText('plant 🌱');
  await page.reload();
  await expect(page.locator('[data-route-id]')).toHaveText('plant 🌱');
  await page.goto('/daily/#/unknown');
  await expect(page.getByRole('heading', { name: 'Page not found', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Page not found', exact: true })).toBeFocused();
  await page.getByRole('link', { name: 'Home', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Today', exact: true })).toBeVisible();
});

test('failed preference saves report failure and retain the previous language', async ({ page }) => {
  await home(page);
  await page.getByRole('button', { name: 'English', exact: true }).click();
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === 'daily:v1') throw new DOMException('Storage full', 'QuotaExceededError');
      return original.call(this, key, value);
    };
  });
  await page.getByRole('button', { name: 'Español', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Could not save');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('daily:v1')).preferences.language)).toBe('en');
});

test('unrecoverable storage is retained and never shown as an empty dashboard', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('daily:v1', '{broken'));
  await home(page);
  await expect(page.getByRole('heading', { name: 'Local data needs attention', exact: true })).toBeVisible();
  await expect(page.locator('#dashboard')).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem('daily:v1'))).toBe('{broken');
  expect(await page.evaluate(() => localStorage.getItem('daily:v1:corrupt'))).toBe('{broken');
});
