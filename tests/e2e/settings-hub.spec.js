import { test, expect } from '@playwright/test';

test('settings hub separates Daily controls from app settings and links directly to each destination', async ({ page }) => {
  await page.goto('/daily/#/');
  await expect(page.getByRole('button', { name: 'Apps', exact: true })).toHaveText('☰');
  await expect(page.locator('.shell-header a[href$="#/settings"]')).toHaveCount(0);
  await page.getByRole('link', { name: 'Daily settings', exact: true }).click();
  const daily = page.getByRole('region', { name: 'Daily', exact: true });
  const apps = page.getByRole('region', { name: 'App settings', exact: true });
  await expect(daily.getByLabel('Language', { exact: true })).toBeVisible();
  await expect(daily.locator('.daily-backup')).toBeVisible();
  await expect(page.locator('#readerPreferencesForm')).toHaveCount(0);
  await expect(daily.locator('#readerPreferencesForm')).toHaveCount(0);
  const before = await page.evaluate(() => localStorage.getItem('daily:v1'));
  for (const [name, destination] of [['Plants', '#/plants/settings'], ['Coffee', '#/coffee/settings'], ['Games', '#/games/settings'], ['Time Budget', '#/time?section=settings'], ['Reader', '#/reading/settings'], ['WhatsApp Later', '#/whatsapp/settings'], ['Piano', '#/piano/settings']]) {
    await apps.getByRole('link', { name, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(destination.replace('?', '\\?') + '$'));
    if (name === 'Time Budget') {
      await expect(page.locator('.time-backup')).toBeVisible();
      await expect(page.locator('[data-menu-panel="plan"]')).not.toBeVisible();
    }
    if (name === 'Reader') await expect(page.locator('#readerPreferencesForm')).toBeVisible();
    if (name === 'WhatsApp Later') await expect(page.locator('.whatsapp-backup')).toBeInViewport();
    expect(await page.evaluate(() => localStorage.getItem('daily:v1'))).toBe(before);
    await page.goto('/daily/#/settings');
  }
});

test('phone settings navigation closes the drawer and translates the two settings scopes', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('/daily/#/settings');
  await page.getByRole('button', { name: 'Apps', exact: true }).click();
  await page.getByRole('link', { name: 'Daily settings', exact: true }).click();
  await expect(page.locator('.shell-sidebar')).not.toBeVisible();
  await page.getByRole('button', { name: 'Español', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Ajustes de apps', exact: true })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Daily', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Apps', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Ajustes de Daily', exact: true })).toHaveAttribute('aria-current', 'page');
  await page.keyboard.press('Escape');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('settings-phone.png'), fullPage: true });
});

test('Piano owns its practice defaults without starting practice or changing Daily preferences', async ({ page }) => {
  await page.goto('/daily/#/piano/settings');
  const preferences = await page.evaluate(() => import('./packages/data/src/daily-state.js').then(({ createDailyState }) => createDailyState(localStorage).read().value.preferences));
  await page.getByLabel('Minutes (3–120)', { exact: true }).fill('15');
  await page.getByLabel('At the piano', { exact: true }).uncheck();
  await page.getByRole('button', { name: 'Save Piano settings', exact: true }).click();
  await expect(page.locator('#piano-settings-form').getByRole('status')).toContainText('Saved');
  await page.reload();
  await expect(page.getByLabel('Minutes (3–120)', { exact: true })).toHaveValue('15');
  await expect(page.getByLabel('At the piano', { exact: true })).not.toBeChecked();
  const data = await page.evaluate(() => JSON.parse(localStorage.getItem('daily:v1')));
  expect(data.modules.piano.data.practice).toBeNull();
  expect(data.preferences).toEqual(preferences);
  await page.goto('/daily/#/piano/learn?lesson=interval-foundations');
  await expect(page.locator('#practice-minutes')).toHaveValue('15');
  await expect(page.locator('[name="piano"]')).not.toBeChecked();
});
