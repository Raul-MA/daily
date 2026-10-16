import { test, expect } from '@playwright/test';
import { prepare, settings } from './fixtures.js';

test('Reader dialog drafts including an unsaved token survive close reopen and a language change', async ({ page }) => {
  await prepare(page);
  await settings(page);
  await page.locator('#progressInput').selectOption('unread');
  await page.locator('#policyInput').selectOption('uniform');
  await page.locator('#tokenInput').fill('fixture-unsaved');
  await page.locator('#closeSettings').click();
  await page.getByRole('button', { name: 'Español', exact: true }).click();
  await settings(page);
  await expect(page.locator('#progressInput')).toHaveValue('unread');
  await expect(page.locator('#policyInput')).toHaveValue('uniform');
  await expect(page.locator('#tokenInput')).toHaveValue('fixture-unsaved');
  expect(await page.evaluate(() => localStorage.getItem('daily:v1'))).not.toContain('fixture-unsaved');
  await expect(page.locator('#pageTitle')).toHaveText('Elige algo para terminar.');
});

test('Reader Spanish controls and metadata preserve fetched article titles and saved picks', async ({ page }) => {
  await prepare(page);
  await page.locator('#pickButton').click();
  await expect(page.locator('#results .result-card')).toHaveCount(3);
  const before = await page.evaluate(() => JSON.stringify(JSON.parse(localStorage.getItem('daily:v1')).modules.reading.data.picks));
  await page.getByRole('button', { name: 'Español', exact: true }).click();
  await expect(page.locator('#pickButton')).toHaveText('Elegir por mí');
  await expect(page.locator('#results .result-title').first()).toHaveText('Started three');
  await expect(page.locator('#results')).toContainText('min restantes');
  expect(await page.evaluate(() => JSON.stringify(JSON.parse(localStorage.getItem('daily:v1')).modules.reading.data.picks))).toBe(before);
});
