import { test, expect } from '@playwright/test';
import { gotoApp, emptyData, bean, entry, testIds, readCoffeeData } from './helpers.js';

test('coffee detail and edit links reload without changing records', async ({ page }) => {
  await gotoApp(page, emptyData({ beanPresets: [bean()], entries: [entry()] }));
  const before = await readCoffeeData(page);
  await page.getByTestId(testIds.navHistory).click();
  await page.getByTestId(testIds.entryRow).click();
  await expect(page).toHaveURL(/#\/coffee\/entry\/[^/]+$/);
  await page.reload();
  await expect(page.getByTestId(testIds.entryDetail)).toBeVisible();
  await page.getByTestId(testIds.editEntry).click();
  await expect(page).toHaveURL(/\/edit$/);
  await page.reload();
  await expect(page.getByTestId(testIds.entryForm)).toBeVisible();
  expect(await readCoffeeData(page)).toEqual(before);
  await page.goto('/daily/#/coffee/entry/missing/edit');
  await expect(page.getByTestId(testIds.entryForm)).toHaveCount(0);
  await expect(page.locator('[data-module=coffee]')).toContainText('Drink not found');
  expect(await readCoffeeData(page)).toEqual(before);
});

test('coffee language changes preserve unsaved values and derived previews', async ({ page }) => {
  await gotoApp(page);
  await page.locator('#doseG').fill('18');
  await page.locator('#yieldValue').fill('42');
  await page.locator('#tastingNotes').fill('Mi café ☕');
  await page.locator('#overallScore').fill('9');
  await page.locator('#overallScore').dispatchEvent('input');
  const before = await readCoffeeData(page);
  await page.getByRole('button', { name: 'Español', exact: true }).click();
  await expect(page.locator('#tastingNotes')).toHaveValue('Mi café ☕');
  await expect(page.locator('#doseG')).toHaveValue('18');
  await expect(page.locator('.slider-pair output')).toHaveText('9');
  await expect(page.getByTestId(testIds.ratioPreview)).toHaveText('1:2.33');
  expect((await readCoffeeData(page)).entries).toEqual(before.entries);
});

test('coffee stale drink edits retain their draft and preserve the other tab change', async ({ page, context }) => {
  await gotoApp(page, emptyData({ beanPresets: [bean()], entries: [entry()] }));
  await page.getByTestId(testIds.navHistory).click();
  await page.getByTestId(testIds.entryRow).click();
  await page.getByTestId(testIds.editEntry).click();
  await page.locator('#freeNotes').fill('Unsaved draft');
  const other = await context.newPage();
  await other.goto('/daily/#/');
  await other.evaluate(() => {
    const root = JSON.parse(localStorage.getItem('daily:v1'));
    root.modules.coffee.data.entries[0].taste.freeNotes = 'Other tab';
    localStorage.setItem('daily:v1', JSON.stringify(root));
  });
  await expect(page.getByTestId(testIds.toast)).toContainText('Data changed');
  await page.getByTestId(testIds.saveShot).click();
  await expect(page.locator('#freeNotes')).toHaveValue('Unsaved draft');
  expect((await readCoffeeData(page)).entries[0].taste.freeNotes).toBe('Other tab');
});

test('coffee import cancellation and future backups leave existing data intact', async ({ page }) => {
  await gotoApp(page);
  await page.getByTestId(testIds.navSettings).click();
  const before = await readCoffeeData(page);
  await page.getByTestId(testIds.importData).setInputFiles({ name: 'coffee.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(before)) });
  await expect(page.locator('[data-coffee-confirm-import]')).toBeDisabled();
  await page.locator('[data-coffee-cancel-import]').click();
  expect(await readCoffeeData(page)).toEqual(before);
  await page.getByTestId(testIds.importData).setInputFiles({ name: 'future.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ ...before, schemaVersion: 99 })) });
  await expect(page.getByTestId(testIds.toast)).toContainText('Unsupported schema');
  expect(await readCoffeeData(page)).toEqual(before);
});

test('coffee failed preference saves keep the draft and previous persisted settings', async ({ page }) => {
  await gotoApp(page);
  await page.getByTestId(testIds.navSettings).click();
  await page.locator('#burrTouchReference').fill('Unsaved reference');
  const before = await readCoffeeData(page);
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === 'daily:v1') throw new Error('QuotaExceededError');
      return original.call(this, key, value);
    };
  });
  await page.getByTestId(testIds.saveSettings).click();
  await expect(page.getByTestId(testIds.toast)).toContainText('QuotaExceededError');
  await expect(page.locator('#burrTouchReference')).toHaveValue('Unsaved reference');
  expect(await readCoffeeData(page)).toEqual(before);
});

test('coffee exporting preserves unsaved settings and stale settings cannot overwrite another tab', async ({ page, context }) => {
  await gotoApp(page);
  await page.getByTestId(testIds.navSettings).click();
  await page.locator('#burrTouchReference').fill('Unsaved draft');
  const download = page.waitForEvent('download');
  await page.getByTestId(testIds.exportData).click();
  await download;
  await expect(page.locator('#burrTouchReference')).toHaveValue('Unsaved draft');
  const other = await context.newPage();
  await other.goto('/daily/#/');
  await other.evaluate(() => {
    const root = JSON.parse(localStorage.getItem('daily:v1'));
    root.modules.coffee.data.settings.burrTouchReference = 'Other tab';
    localStorage.setItem('daily:v1', JSON.stringify(root));
  });
  await expect(page.getByTestId(testIds.toast)).toContainText('Data changed');
  await page.getByTestId(testIds.saveSettings).click();
  await expect(page.locator('#burrTouchReference')).toHaveValue('Unsaved draft');
  expect((await readCoffeeData(page)).settings.burrTouchReference).toBe('Other tab');
});
