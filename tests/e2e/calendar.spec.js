import { test, expect } from '@playwright/test';

test.use({ timezoneId: 'UTC' });

test('dashboard care reminders refresh at midnight without changing records', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-15T23:59:57Z') });
  await page.clock.pauseAt(new Date('2026-10-15T23:59:58Z'));
  await page.addInitScript(() => {
    const plant = { id: 'tomorrow', name: 'Tomorrow fern', dateAdded: '2026-10-15', schedule: { wateringIntervalDays: 7, soilIntervalMonths: 12, fertilizerIntervalWeeks: 4, nextDueOverrides: { watering: '2026-10-16' } }, careLog: [] };
    const data = { plants: [plant], things: { enabled: false, project: '' }, backup: { lastExportAt: null, lastReminderAt: null, changesSinceExport: 0 }, storage: { persistenceRequested: false, persistent: false, checkedAt: null } };
    localStorage.setItem('daily:v1', JSON.stringify({ version: 1, preferences: { language: 'en', widgets: ['plants'], quickActions: [] }, modules: { plants: { version: 1, data } } }));
  });
  await page.goto('/daily/#/');
  await expect(page.locator('[data-widget="plants"]').getByRole('link', { name: /Tomorrow fern/ })).toHaveCount(0);
  const before = await page.evaluate(() => localStorage.getItem('daily:v1'));
  await page.clock.fastForward(4000);
  await expect(page.locator('[data-widget="plants"]').getByRole('link', { name: /Tomorrow fern/ })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('daily:v1'))).toBe(before);
});
