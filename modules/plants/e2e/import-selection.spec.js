import { test, expect } from '@playwright/test';

const plant = { id: 'fern-import', name: 'Imported fern 🌱', dateAdded: '2026-01-01T12:00:00Z', schedule: { wateringIntervalDays: 7 }, careLog: [{ id: 'water-import', type: 'watering', date: '2026-01-02' }] };

test('selecting a plant backup opens a read-only preview and allows retry after cancel or invalid JSON', async ({ page }) => {
  await page.goto('/daily/#/plants/settings');
  const before = await page.evaluate(() => localStorage.getItem('daily:v1'));
  const input = page.getByLabel('Plant backup file', { exact: true });
  const file = { name: 'plants.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify([plant])) };
  await input.setInputFiles(file);
  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText('1 plant');
  expect(await page.evaluate(() => localStorage.getItem('daily:v1'))).toBe(before);
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
  await page.getByRole('button', { name: 'Preview import', exact: true }).click();
  await expect(dialog).toContainText('1 plant');
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
  await input.setInputFiles({ name: 'invalid.json', mimeType: 'application/json', buffer: Buffer.from('{bad') });
  await expect(page.locator('[data-module="plants"]').getByRole('alert')).toBeInViewport();
  expect(await page.evaluate(() => localStorage.getItem('daily:v1'))).toBe(before);
  await input.setInputFiles(file);
  await expect(dialog).toContainText('1 plant');
  const replace = dialog.getByRole('button', { name: 'Replace plants', exact: true });
  await expect(replace).toBeEnabled();
  const download = page.waitForEvent('download');
  await replace.click();
  expect((await download).suggestedFilename()).toBe('stillgreen-recovery.json');
  await expect(dialog).toHaveCount(0);
  await page.reload();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('daily:v1')).modules.plants.data.plants)).toEqual([plant]);
});
