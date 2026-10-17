import { test, expect } from '@playwright/test';
import { prepare, settings, save } from './fixtures.js';

test('Spanish Reader and Home report failed item saves and recovery downloads without leaving or replacing data', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await prepare(page);
  await settings(page);
  await page.locator('#rememberLastItem').check();
  await save(page);
  await page.locator('#pickButton').click();
  await expect(page.locator('.result-card')).toHaveCount(3);
  await page.getByRole('button', { name: 'Español', exact: true }).click();
  const before = await page.evaluate(() => localStorage.getItem('daily:v1'));
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === 'daily:v1') throw new DOMException('full', 'QuotaExceededError');
      return original.call(this, key, value);
    };
  });
  await page.locator('.result-card').first().click();
  await expect(page.locator('#status')).toContainText('No se pudo guardar.');
  await page.getByRole('link', { name: 'Inicio', exact: true }).click();
  await page.locator('[data-reading-reader] a').first().click();
  await expect(page.locator('[data-reading-reader] [role=alert]')).toContainText('No se pudo guardar.');
  await page.goto('./#/reading/picker');
  await settings(page);
  let confirmation;
  page.once('dialog', async dialog => { confirmation = dialog.message(); await dialog.dismiss(); });
  await page.locator('#clearDataButton').click();
  expect(confirmation).toMatch(/Eliminar.*token.*Reader/);
  expect(await page.evaluate(() => localStorage.getItem('daily:v1'))).toBe(before);
  await page.locator('#reader-import-file').setInputFiles({ name: 'reader.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ app: 'daily-reading', schemaVersion: 1, data: JSON.parse(before).modules.reading.data })) });
  await expect(page.locator('#reader-import-preview')).toBeVisible();
  await page.evaluate(() => {
    const original = Storage.prototype.getItem;
    window.restoreReaderRead = () => { Storage.prototype.getItem = original; };
    Storage.prototype.getItem = function (key) {
      if (key === 'daily:v1') throw new Error('Storage blocked');
      return original.call(this, key);
    };
  });
  await page.locator('#reader-import-recovery').click();
  await expect(page.locator('#reader-import-status')).toContainText('No se pudo guardar.');
  expect(errors).toEqual([]);
  await page.evaluate(() => window.restoreReaderRead());
  expect(await page.evaluate(() => localStorage.getItem('daily:v1'))).toBe(before);
});
