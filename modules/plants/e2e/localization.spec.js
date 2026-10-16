import { test, expect } from '@playwright/test';

test.use({ serviceWorkers: 'allow' });

test('template defaults follow the selected language while existing form text survives later language changes', async ({ page }) => {
  await page.goto('/daily/#/plants/new');
  await page.locator('[name=template]').selectOption('zz-plant');
  await expect(page.locator('[name=notes]')).toHaveValue(/Stores water in rhizomes/);
  await page.getByLabel('Plant name', { exact: true }).fill('Mi ZZ 🌱');
  await page.locator('[name=notes]').fill('Mi nota: Water no se traduce');
  await page.getByRole('button', { name: 'Español', exact: true }).click();
  await expect(page.locator('[name=notes]')).toHaveValue('Mi nota: Water no se traduce');
  await expect(page.locator('[name=name]')).toHaveValue('Mi ZZ 🌱');
  await page.locator('[name=template]').selectOption('lucky-bamboo');
  await expect(page.locator('[name=template] option:checked')).toHaveText('Bambú de la suerte (en tierra)');
  await expect(page.locator('[name=notes]')).toHaveValue(/Puede crecer en tierra húmeda/);
  const draft = await page.locator('[name=notes]').inputValue();
  await page.getByRole('button', { name: 'English', exact: true }).click();
  await expect(page.locator('[name=template] option:checked')).toHaveText('Lucky Bamboo (in soil)');
  await expect(page.locator('[name=notes]')).toHaveValue(draft);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('daily:v1')).modules)).toEqual({});
});

test('authored plant guides switch language offline without translating saved records or changing care timing', async ({ page, context }) => {
  await page.setViewportSize({ width: 320, height: 760 });
  await page.addInitScript(() => {
    if (localStorage.getItem('daily:v1')) return;
    const plant = { id: 'zz-user', templateId: 'zz-plant', name: 'Mi ZZ 🌱', commonName: 'Tipo personal', notes: 'Mi nota: Water no se traduce', dateAdded: '2026-10-01', schedule: { wateringIntervalDays: 15 }, careLog: [] };
    const data = { plants: [plant], things: { enabled: false, project: '' }, backup: { lastExportAt: null, lastReminderAt: null, changesSinceExport: 0 }, storage: { persistenceRequested: false, persistent: false, checkedAt: null } };
    localStorage.setItem('daily:v1', JSON.stringify({ version: 1, preferences: { language: 'en', widgets: ['plants'], quickActions: [] }, modules: { plants: { version: 1, data } } }));
  });
  await page.goto('/daily/#/plants/zz-user');
  await expect(page.locator('.care-guide')).toContainText('Cool season');
  await expect(page.locator('.detail-notes')).toHaveText('Mi nota: Water no se traduce');
  const before = await page.evaluate(() => JSON.stringify(JSON.parse(localStorage.getItem('daily:v1')).modules));
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('.care-guide')).toContainText('Cool season');
  await page.getByRole('button', { name: 'Español', exact: true }).click();
  await expect(page.locator('.care-guide')).toContainText('Época fresca');
  await expect(page.getByRole('heading', { name: 'Mi ZZ 🌱', exact: true })).toBeVisible();
  await expect(page.locator('.detail-species')).toHaveText('Tipo personal');
  await expect(page.locator('.detail-notes')).toHaveText('Mi nota: Water no se traduce');
  expect(await page.evaluate(() => JSON.stringify(JSON.parse(localStorage.getItem('daily:v1')).modules))).toBe(before);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
