import { test, expect } from '@playwright/test';
import { open, start, section } from './helpers.js';

const saved = page => page.evaluate(() => localStorage.getItem('daily:v1'));

test('original template imports reveal the recovery-gated preview without saving', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 }); await open(page);
  const before = await saved(page);
  await page.locator('.template-section summary').click();
  const templates = { Imported: [{ name: 'Focus', minutes: 5 }] };
  await page.locator('.template-section input[type=file]').setInputFiles({ name: 'templates.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(templates)) });
  await expect(page.locator('.time-backup')).toBeVisible();
  await expect(page.locator('[data-time-import-preview]')).toBeInViewport();
  await expect(page.locator('[data-time-import-preview] p')).toContainText('1 templates');
  await expect(page.locator('[data-time-confirm]')).toBeDisabled();
  expect(await saved(page)).toBe(before);
  await page.locator('[data-time-cancel]').click(); expect(await saved(page)).toBe(before);
});

test('returning to a running plan focuses its visible heading outside the closed drawer', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 }); await open(page); await start(page);
  const before = await saved(page);
  await section(page, 'Countdowns'); await section(page, 'Time Budget');
  await expect(page.locator('#currentTaskName')).toBeFocused();
  expect(await page.evaluate(() => Boolean(document.activeElement.closest('[inert]')))).toBe(false);
  expect(await saved(page)).toBe(before);
});
