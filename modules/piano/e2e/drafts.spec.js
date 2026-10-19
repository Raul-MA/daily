import { test, expect } from '@playwright/test';

test('piano language remounts retain setup and pacing drafts with their derived controls', async ({ page }) => {
  await page.goto('./#/piano/learn?lesson=interval-foundations');
  await page.locator('[data-disclosure="duration"] summary').click();
  await page.locator('#practice-minutes').fill('7');
  await page.locator('[name="piano"]').uncheck();
  await page.getByRole('button', { name: 'Español', exact: true }).click();
  await expect(page.locator('#practice-minutes')).toHaveValue('7');
  await expect(page.locator('[name="piano"]')).not.toBeChecked();
  await expect(page.locator('[data-preview="0"]')).toHaveText('0:42');
  expect(await page.locator('[data-disclosure="duration"]').evaluate(node => node.open)).toBe(true);
  await page.locator('.practice-setup button[type="submit"]').click();
  await page.locator('[data-action="next"]').click();
  await page.locator('[data-disclosure="pacing"] summary').click();
  await page.locator('#practice-pace').fill('0');
  const saved = await page.evaluate(() => JSON.stringify(JSON.parse(localStorage.getItem('daily:v1')).modules.piano));
  await page.getByRole('button', { name: 'English', exact: true }).click();
  await expect(page.locator('#practice-pace')).toHaveValue('0');
  await expect(page.locator('#practice-pace-validation')).toContainText('1 to 300');
  expect(await page.locator('[data-disclosure="pacing"]').evaluate(node => node.open)).toBe(true);
  expect(await page.evaluate(() => JSON.stringify(JSON.parse(localStorage.getItem('daily:v1')).modules.piano))).toBe(saved);
});

test('piano failed pause or pacing saves preserve the running record and truthful controls', async ({ page }) => {
  await page.goto('./#/piano/learn?lesson=interval-foundations');
  await page.locator('.practice-setup button[type="submit"]').click();
  await page.locator('[data-action="next"]').click();
  await page.locator('[data-disclosure="pacing"] summary').click();
  await page.locator('[name="auto"]').check();
  const before = await page.evaluate(() => localStorage.getItem('daily:v1'));
  await page.evaluate(() => { Storage.prototype.setItem = () => { throw new Error('QuotaExceededError'); }; });
  await page.locator('[data-action="pause"]').click();
  await expect(page.locator('[data-piano-error]')).toContainText('QuotaExceededError');
  await expect(page.locator('[data-action="pause"]')).toHaveText('Pause');
  await page.locator('[name="auto"]').click();
  await expect(page.locator('[name="auto"]')).toBeChecked();
  expect(await page.evaluate(() => localStorage.getItem('daily:v1'))).toBe(before);
});
