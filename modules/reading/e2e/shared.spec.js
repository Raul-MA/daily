import { test, expect } from '@playwright/test';
import { prepare, settings, save, target } from './fixtures.js';

async function data(page) { return page.evaluate(() => JSON.parse(localStorage.getItem('daily:v1')).modules.reading.data); }

test('Reader shortcut launch overrides do not replace saved preferences', async ({ page }) => {
  await prepare(page, { query: 'count=2&minutes=5&run=1' });
  await expect(page.locator('#results .result-card')).toHaveCount(2);
  expect((await data(page)).settings.count).toBe(3);
  expect((await data(page)).settings.minutes).toBe(10);
  await page.locator('#countInput').selectOption('5');
  expect((await data(page)).settings.count).toBe(5);
});

test('Reader custom count time policy and unknown-duration settings persist', async ({ page }) => {
  await prepare(page);
  await page.locator('#countInput').selectOption('custom');
  await page.locator('#customCount').fill('7');
  await page.locator('#customCount').dispatchEvent('change');
  await page.locator('#minutesInput').selectOption('custom');
  await page.locator('#customMinutes').fill('12');
  await page.locator('#customMinutes').dispatchEvent('change');
  await settings(page);
  await page.locator('#policyInput').selectOption('uniform');
  await page.locator('#includeUnknown').check();
  await save(page);
  await page.reload();
  await expect(page.locator('#customCount')).toHaveValue('7');
  await expect(page.locator('#customMinutes')).toHaveValue('12');
  expect((await data(page)).settings.policy).toBe('uniform');
  expect((await data(page)).settings.includeUnknown).toBe(true);
});

test('Reader saved picks survive Home and reload without reshuffling or new API calls', async ({ page }) => {
  const calls = await prepare(page);
  await page.locator('#pickButton').click();
  await expect(page.locator('#results .result-card')).toHaveCount(3);
  const saved = (await data(page)).picks;
  const requests = calls.filter(url => url.pathname.endsWith('/list/')).length;
  await page.getByRole('link', { name: 'Home', exact: true }).click();
  await expect(page.locator('[data-widget="reader"]')).toContainText('Started three');
  await page.goto(target());
  await expect(page.locator('#results .result-card')).toHaveCount(3);
  expect((await data(page)).picks).toEqual(saved);
  await expect(page.locator('[data-reader-freshness]')).toContainText('Last fetched');
  expect(calls.filter(url => url.pathname.endsWith('/list/')).length).toBe(requests);
  await page.reload();
  await expect(page.locator('#results .result-card')).toHaveCount(3);
  expect((await data(page)).picks).toEqual(saved);
  await expect(page.locator('[data-reader-freshness]')).toContainText('Last fetched');
  expect(calls.filter(url => url.pathname.endsWith('/list/')).length).toBe(requests);
});

test('Reader forget removes account picks and credential storage while preserving preferences and other modules', async ({ page }) => {
  await prepare(page);
  await page.locator('#countInput').selectOption('5');
  await page.locator('#pickButton').click();
  await expect(page.locator('#results .result-card')).toHaveCount(3);
  await page.evaluate(() => {
    const root = JSON.parse(localStorage.getItem('daily:v1'));
    root.modules.fixture = { version: 1, data: { note: 'untouched' } };
    localStorage.setItem('daily:v1', JSON.stringify(root));
  });
  await settings(page);
  await page.locator('#forgetTokenButton').click();
  await expect(page.locator('#results .result-card')).toHaveCount(0);
  expect((await data(page)).settings.count).toBe(5);
  expect((await data(page)).picks).toBeNull();
  expect(await page.evaluate(() => sessionStorage.getItem('daily:readwise:session:v1'))).toBeNull();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('daily:v1')).modules.fixture.data.note)).toBe('untouched');
  expect(await page.evaluate(() => localStorage.getItem('daily:v1'))).not.toContain('fixture-only');
});

test('central Reader preferences and the app edit the same settings and retain language drafts', async ({ page }) => {
  await prepare(page);
  await page.goto('./#/settings');
  await expect(page.locator('#readerPreferencesForm')).toBeVisible();
  await page.locator('#reader-default-count').fill('8');
  await page.getByRole('button', { name: 'Español', exact: true }).click();
  await expect(page.locator('#reader-default-count')).toHaveValue('8');
  await page.locator('#readerPreferencesForm button[type="submit"]').click();
  expect((await data(page)).settings.count).toBe(8);
  await page.goto(target());
  await expect(page.locator('#customCount')).toHaveValue('8');
  await settings(page);
  await expect(page.locator('#policyInput')).toHaveValue('started-first');
});
