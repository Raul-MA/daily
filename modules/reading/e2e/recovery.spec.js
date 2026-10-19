import { test, expect } from '@playwright/test';
import { prepare, settings } from './fixtures.js';

test('invalid Reader custom-control drafts survive a language change without changing saved preferences', async ({ page }) => {
  await prepare(page);
  await page.locator('#countInput').selectOption('custom');
  await page.locator('#customCount').fill('0');
  await page.getByRole('button', { name: 'Español', exact: true }).click();
  await expect(page.locator('#countInput')).toHaveValue('custom');
  await expect(page.locator('#customCount')).toHaveValue('0');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('daily:v1')).modules.reading.data.settings.count)).toBe(3);
  await page.locator('#customCount').fill('7');
  await page.locator('#customCount').dispatchEvent('change');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('daily:v1')).modules.reading.data.settings.count)).toBe(7);
});

test('Reader stale preference drafts cannot overwrite another tab and quota failures remain visible', async ({ page, context }) => {
  await prepare(page);
  await page.locator('#countInput').selectOption('3');
  await settings(page);
  await page.locator('#progressInput').selectOption('started');
  const other = await context.newPage();
  await other.goto('./#/settings');
  await other.evaluate(() => {
    const root = JSON.parse(localStorage.getItem('daily:v1'));
    root.modules.reading.data.settings.count = 5;
    localStorage.setItem('daily:v1', JSON.stringify(root));
  });
  await expect(page.locator('#settingsStatus')).toContainText(/changed|draft/i);
  await page.locator('#settingsForm button[type="submit"]').click();
  await expect(page.locator('#settingsStatus')).toContainText(/changed|draft/i);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('daily:v1')).modules.reading.data.settings.count)).toBe(5);
  await page.locator('#closeSettings').click();
  await page.locator('#countInput').selectOption('1');
  await expect(page.locator('#status')).toContainText(/changed|draft/i);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('daily:v1')).modules.reading.data.settings.count)).toBe(5);
  await other.close();
  await page.reload();
  const before = await page.evaluate(() => localStorage.getItem('daily:v1'));
  await page.evaluate(() => { Storage.prototype.setItem = () => { throw new Error('QuotaExceededError'); }; });
  await page.locator('#countInput').selectOption('3');
  await expect(page.locator('#status')).toContainText(/saving failed|previous/i);
  expect(await page.evaluate(() => localStorage.getItem('daily:v1'))).toBe(before);
});
