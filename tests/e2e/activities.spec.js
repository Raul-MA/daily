import { test, expect } from '@playwright/test';

async function seed(page) {
  await page.addInitScript(() => {
    const active = { id: 'tea', kind: 'countdown', label: 'Té 🍵', reference: 'tea', durationMs: 60000, status: 'running', startedAt: Date.now() - 90000, resumedAt: Date.now() - 90000, elapsedMs: 0, updatedAt: Date.now() - 90000 };
    localStorage.setItem('daily:v1', JSON.stringify({ version: 1, preferences: { language: 'en', widgets: ['activities'], quickActions: [] }, modules: { activities: { version: 1, data: [active] } } }));
  });
}

test('running summaries link to their source and derive overdue time without storage writes', async ({ page }) => {
  await seed(page);
  await page.goto('/daily/#/');
  const raw = await page.evaluate(() => localStorage.getItem('daily:v1'));
  await expect(page.locator('[data-widget="activities"]')).toContainText('Té 🍵');
  await expect(page.locator('[data-widget="activities"]')).toContainText('Overdue');
  await expect(page.getByRole('navigation', { name: 'Running activities' }).getByRole('link')).toHaveCount(1);
  await expect(page.locator('#dashboard button')).toHaveCount(0);
  await page.setViewportSize({ width: 390, height: 844 });
  const disclosure = page.getByRole('button', { name: 'Running · 1', exact: true });
  await expect(disclosure).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('.running-indicator .activity-link')).not.toBeVisible();
  await disclosure.click();
  await expect(disclosure).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('.running-indicator .activity-link')).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('daily:v1'))).toBe(raw);
  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(disclosure).not.toBeVisible();
  await expect(page.locator('.running-indicator .activity-link')).toBeVisible();
  await page.waitForTimeout(1100);
  expect(await page.evaluate(() => localStorage.getItem('daily:v1'))).toBe(raw);
  await page.locator('[data-widget="activities"]').getByRole('link', { name: /Té/ }).click();
  await expect(page).toHaveURL(/#\/time\?activity=tea$/);
  expect(await page.evaluate(() => localStorage.getItem('daily:v1'))).toBe(raw);
});

test('removing the activity widget keeps the shared indicator and running state', async ({ page }) => {
  await seed(page);
  await page.goto('/daily/#/settings');
  await page.getByRole('checkbox', { name: 'Running', exact: true }).uncheck();
  await page.getByRole('link', { name: 'Home', exact: true }).click();
  await expect(page.locator('[data-widget="activities"]')).toHaveCount(0);
  await expect(page.getByRole('navigation', { name: 'Running activities' })).toContainText('Té 🍵');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('daily:v1')).modules.activities.data[0].status)).toBe('running');
});

test('activity failure is isolated from the rest of the dashboard', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('daily:v1', JSON.stringify({ version: 1, preferences: { language: 'en', widgets: ['activities', 'quick'], quickActions: ['coffee'] }, modules: { activities: { version: 2, data: [] } } }));
  });
  await page.goto('/daily/#/');
  await expect(page.getByRole('heading', { name: 'Today', exact: true })).toBeVisible();
  await expect(page.locator('[data-widget="activities"]')).toContainText('could not be read');
  await expect(page.getByRole('link', { name: 'Log coffee', exact: true })).toBeVisible();
});
