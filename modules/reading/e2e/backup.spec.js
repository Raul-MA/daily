import { test, expect } from '@playwright/test';
import { prepare, settings } from './fixtures.js';

async function downloadText(download) {
  const stream = await download.createReadStream();
  let text = '';
  for await (const chunk of stream) text += chunk.toString();
  return text;
}
async function choose(page, input) {
  await page.locator('#reader-import-file').setInputFiles({ name: 'reader.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(input)) });
  await expect(page.locator('#reader-import-preview')).toBeVisible();
}

test('Reader exports persisted preferences without credentials or unsaved token drafts', async ({ page }) => {
  await prepare(page);
  await page.locator('#pickButton').click();
  await expect(page.locator('#results .result-card')).toHaveCount(3);
  await settings(page);
  await page.locator('#tokenInput').fill('fixture-unsaved');
  const pending = page.waitForEvent('download');
  await page.locator('#reader-export').click();
  const text = await downloadText(await pending);
  expect(JSON.parse(text).app).toBe('daily-reading');
  expect(text).not.toContain('fixture-only');
  expect(text).not.toContain('fixture-unsaved');
  await expect(page.locator('#tokenInput')).toHaveValue('fixture-unsaved');
});

test('Reader import previews cancel safely and require recovery before confirmation and token reentry', async ({ page }) => {
  await prepare(page);
  await page.locator('#pickButton').click();
  await expect(page.locator('#results .result-card')).toHaveCount(3);
  const before = await page.evaluate(() => localStorage.getItem('daily:v1'));
  const incoming = JSON.parse(before).modules.reading.data;
  incoming.settings.count = 7;
  const input = { app: 'daily-reading', schemaVersion: 1, data: incoming };
  await settings(page);
  await choose(page, input);
  expect(await page.evaluate(() => localStorage.getItem('daily:v1'))).toBe(before);
  await expect(page.locator('#reader-import-confirm')).toBeDisabled();
  await page.locator('#reader-import-cancel').click();
  await expect(page.locator('#reader-import-preview')).not.toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('daily:v1'))).toBe(before);
  await choose(page, input);
  const pending = page.waitForEvent('download');
  await page.locator('#reader-import-recovery').click();
  expect(await downloadText(await pending)).not.toContain('fixture-only');
  await expect(page.locator('#reader-import-confirm')).toBeEnabled();
  await page.locator('#reader-import-confirm').click();
  await expect(page.locator('#reader-import-status')).toContainText(/import.*saved|import.*complete/i);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('daily:v1')).modules.reading.data.settings.count)).toBe(7);
  expect(await page.evaluate(() => sessionStorage.getItem('daily:readwise:session:v1'))).toBeNull();
  await expect(page.locator('#tokenInput')).toHaveValue('');
});

test('Reader invalid import can be canceled after language changes while keeping unsaved token and preference drafts', async ({ page }) => {
  await prepare(page);
  const before = await page.evaluate(() => JSON.stringify(JSON.parse(localStorage.getItem('daily:v1') ?? '{"modules":{}}').modules));
  await settings(page);
  await page.locator('#tokenInput').fill('fixture-unsaved-private');
  await page.locator('#progressInput').selectOption('started');
  await page.locator('#reader-import-file').setInputFiles({ name: 'invalid.json', mimeType: 'application/json', buffer: Buffer.from('invalid JSON') });
  await expect(page.locator('#reader-import-status')).toContainText(/JSON|Unexpected|Invalid/i);
  await expect(page.locator('#reader-import-cancel')).toBeVisible();
  await page.locator('#closeSettings').click();
  await page.getByRole('button', { name: 'Español', exact: true }).click();
  await settings(page);
  await page.locator('#reader-import-cancel').click();
  await expect(page.locator('#reader-import')).toHaveAttribute('data-unsaved', 'false');
  await expect(page.locator('#settingsForm')).toHaveAttribute('data-unsaved', 'true');
  await expect(page.locator('#tokenInput')).toHaveValue('fixture-unsaved-private');
  await expect(page.locator('#progressInput')).toHaveValue('started');
  expect(await page.evaluate(() => JSON.stringify(JSON.parse(localStorage.getItem('daily:v1')).modules))).toBe(before);
});
