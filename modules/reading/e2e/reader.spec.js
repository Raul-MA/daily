import { test, expect } from '@playwright/test';
import { prepare, settings, save, query, baseline, items } from './fixtures.js';

test('Reader retains original time and count controls across reload', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await prepare(page);
  await expect(page.locator('#minutesInput')).toHaveValue('10');
  await expect(page.locator('#countInput')).toHaveValue('3');
  await page.locator('#minutesInput').selectOption('15');
  await page.locator('#countInput').selectOption('5');
  await page.reload();
  await expect(page.locator('#minutesInput')).toHaveValue('15');
  await expect(page.locator('#countInput')).toHaveValue('5');
  const host = page.locator(baseline ? 'main.shell' : '[data-module="reading"]');
  await host.screenshot({ path: baseline ? 'reports/reader-source-phone.png' : 'reports/reader-native-phone.png' });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('Reader returns distinct started-first picks fitting estimated remaining time', async ({ page }) => {
  await prepare(page);
  await page.locator('#minutesInput').selectOption('5');
  await page.locator('#pickButton').click();
  await expect(page.locator('#results .result-card')).toHaveCount(3);
  await expect(page.locator('#results .result-title').first()).toHaveText('Started three');
  await expect(page.locator('#results')).toContainText('3 min left');
  await expect(page.locator('#results')).not.toContainText('Too long');
  const links = await page.locator('#results .result-card').evaluateAll(nodes => nodes.map(node => node.href));
  expect(new Set(links).size).toBe(3);
});

test('Reader saves progress location cache and shortcut behavior without leaking tokens into URLs', async ({ page }) => {
  await prepare(page);
  await settings(page);
  await page.locator('#progressInput').selectOption('started');
  await page.locator('#locationNew').uncheck();
  await page.locator('#locationShortlist').uncheck();
  await page.locator('#cacheMinutesInput').selectOption('5');
  await page.locator('#scanLimitInput').selectOption('100');
  await page.locator('#updateUrlOnPick').check();
  await save(page);
  await page.locator('#pickButton').click();
  await expect(page.locator('#results .result-card')).toHaveCount(1);
  expect(query(page).get('progress')).toBe('started');
  expect(query(page).get('locations')).toBe('later');
  expect(query(page).get('run')).toBe('1');
  expect(page.url()).not.toContain('fixture-only');
  await settings(page);
  await expect(page.locator('#progressInput')).toHaveValue('started');
  await expect(page.locator('#cacheMinutesInput')).toHaveValue('5');
  await expect(page.locator('#scanLimitInput')).toHaveValue('100');
});

test('Reader pick again reuses fresh metadata rather than making additional requests', async ({ page }) => {
  const calls = await prepare(page);
  await page.locator('#pickButton').click();
  await expect(page.locator('#results .result-card')).toHaveCount(3);
  const fetched = calls.length;
  expect(fetched).toBe(3);
  await page.locator('#againButton').click();
  await expect(page.locator('#results .result-card')).toHaveCount(3);
  expect(calls.length).toBe(fetched);
});

test('Reader distinguishes rejected tokens and throttled document requests', async ({ page }) => {
  await prepare(page, { handle: async (route, url) => {
    await route.fulfill({ status: url.pathname.endsWith('/auth/') ? 401 : 429, json: {} });
    return true;
  } });
  await settings(page);
  await page.locator('#testButton').click();
  await expect(page.locator('#settingsStatus')).toContainText(/not accepted|invalid|401/i);
  await page.locator('#closeSettings').click();
  await page.locator('#pickButton').click();
  await expect(page.locator('#status')).toContainText(/rate limit|429/i);
  await expect(page.locator('#results .result-card')).toHaveCount(0);
});


test('Reader remembers opened items and revalidates them before offering unfinished continuation', async ({ page }) => {
  let archived = false;
  await prepare(page, { handle: async (route, url) => {
    const id = url.searchParams.get('id');
    if (!id) return false;
    const item = items.find(value => value.id === id);
    await route.fulfill({ json: { results: item ? [{ ...item, location: archived ? 'archive' : item.location }] : [], nextPageCursor: null } });
    return true;
  } });
  await page.route('https://read.readwise.io/**', route => route.fulfill({ contentType: 'text/html', body: '<h1>Synthetic Reader handoff</h1>' }));
  await settings(page);
  await page.locator('#rememberLastItem').check();
  await save(page);
  await page.locator('#pickButton').click();
  await expect(page.locator('#results .result-card')).toHaveCount(3);
  await page.locator('#results .result-card').first().click();
  await page.waitForURL('https://read.readwise.io/**');
  await page.goto(baseline ? process.env.DAILY_BASELINE_URL : 'http://127.0.0.1:8766/daily/#/reading/picker');
  await expect(page.locator('#lastItemSection')).toBeVisible();
  archived = true;
  await page.reload();
  await expect(page.locator('#lastItemSection')).not.toBeVisible();
});
