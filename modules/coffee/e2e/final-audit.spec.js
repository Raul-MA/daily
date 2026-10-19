import { test, expect } from '@playwright/test';
import { gotoApp, emptyData, bean, entry, testIds, readCoffeeData } from './helpers.js';

async function failWrites(page) {
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    window.coffeeWrites = 0;
    window.coffeeQuota = true;
    Storage.prototype.setItem = function (key, value) {
      if (key === 'daily:v1') {
        window.coffeeWrites++;
        if (window.coffeeQuota) throw new Error('QuotaExceededError');
      }
      return original.call(this, key, value);
    };
  });
}
async function setupFailure(page, action) {
  const data = emptyData();
  data.settings.toolsConfigured = false;
  await gotoApp(page, data);
  const before = await readCoffeeData(page);
  await failWrites(page);
  await page.getByTestId(action).click();
  await expect(page.getByTestId(testIds.toast)).toContainText('QuotaExceededError');
  await expect(page.getByTestId(testIds.toolsSetupForm)).toBeVisible();
  expect(await readCoffeeData(page)).toEqual(before);
  await page.evaluate(() => { window.coffeeQuota = false; window.coffeeWrites = 0; });
  await page.getByTestId(action).click();
  await expect(page.getByTestId(testIds.entryForm)).toBeVisible();
  expect(await page.evaluate(() => window.coffeeWrites)).toBe(1);
  expect((await readCoffeeData(page)).beanPresets).toHaveLength(1);
}

test('coffee restored history filters refresh the translated status and actual list', async ({ page }) => {
  await gotoApp(page, emptyData({ beanPresets: [bean()], entries: [entry()] }));
  await page.getByTestId(testIds.navHistory).click();
  await page.getByTestId(testIds.toggleFilters).click();
  await page.locator('#scoreMin').fill('10');
  await expect(page.getByTestId(testIds.entryRow)).toHaveCount(0);
  await page.getByRole('button', { name: 'Español', exact: true }).click();
  await expect(page.locator('#scoreMin')).toBeVisible();
  await expect(page.locator('#scoreMin')).toHaveValue('10');
  await expect(page.getByTestId(testIds.filterStatus)).toHaveText('Filtrado');
  await expect(page.getByTestId(testIds.entryRow)).toHaveCount(0);
});

test('coffee failed first tools Save retains setup and retries with one root replacement', async ({ page }) => {
  await setupFailure(page, testIds.saveToolsSetup);
});

test('coffee failed first tools Skip retains setup and retries with one root replacement', async ({ page }) => {
  await setupFailure(page, testIds.skipToolsSetup);
});

test('coffee notifications translate and expire at the original deadline through remounts', async ({ page }) => {
  await page.clock.install();
  await page.clock.pauseAt(new Date());
  await gotoApp(page);
  await page.getByTestId(testIds.navSettings).click();
  await page.getByTestId(testIds.saveSettings).click();
  await expect(page.getByTestId(testIds.toast)).toHaveText('Settings saved.');
  await page.clock.fastForward(2000);
  await page.getByRole('button', { name: 'Español', exact: true }).click();
  await expect(page.getByTestId(testIds.toast)).toHaveText('Ajustes guardados.');
  await page.clock.fastForward(1300);
  await expect(page.getByTestId(testIds.toast)).toBeHidden();
  await page.getByRole('button', { name: 'English', exact: true }).click();
  await expect(page.getByTestId(testIds.toast)).toBeHidden();
});

test('coffee Spanish import preview translates its merge mode without altering bean names', async ({ page }) => {
  await gotoApp(page);
  await page.getByTestId(testIds.navSettings).click();
  const data = await readCoffeeData(page);
  await page.getByRole('button', { name: 'Español', exact: true }).click();
  await page.getByTestId(testIds.importData).setInputFiles({ name: 'coffee.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(data)) });
  await expect(page.locator('[data-coffee-import-preview]')).toContainText('Fusionar y sobrescribir IDs coincidentes');
  expect((await readCoffeeData(page)).beanPresets).toEqual(data.beanPresets);
});

test('coffee history view deletion and export report quota failures without false success', async ({ page }) => {
  await gotoApp(page, emptyData({ beanPresets: [bean()], entries: [entry()] }));
  const before = await readCoffeeData(page);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await failWrites(page);
  await page.getByTestId(testIds.navHistory).click();
  await page.getByTestId(testIds.historyViewDetailed).click();
  await expect(page.getByTestId(testIds.toast)).toContainText('QuotaExceededError');
  await expect(page.getByTestId(testIds.historyViewCompact)).toHaveAttribute('aria-pressed', 'true');
  await page.getByTestId(testIds.entryRow).click();
  page.on('dialog', dialog => dialog.accept());
  await page.getByTestId(testIds.deleteEntry).click();
  await expect(page.getByTestId(testIds.toast)).toContainText('QuotaExceededError');
  await expect(page.getByTestId(testIds.entryDetail)).toBeVisible();
  await page.getByTestId(testIds.navSettings).click();
  let downloaded = false;
  page.on('download', () => { downloaded = true; });
  await page.getByTestId(testIds.exportData).click();
  await expect(page.getByTestId(testIds.toast)).toContainText('QuotaExceededError');
  expect(downloaded).toBe(false);
  expect(errors).toEqual([]);
  expect(await readCoffeeData(page)).toEqual(before);
});
