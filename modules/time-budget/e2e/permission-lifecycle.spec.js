import { test, expect } from '@playwright/test';
import { open, plan } from './helpers.js';

async function pendingPermission(page) {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'Notification', { configurable: true, value: class {
      static permission = 'default';
      static requestPermission() { return new Promise(resolve => { window.resolveBudgetPermission = resolve; }); }
    } });
  });
  await open(page);
  await plan(page);
  await page.getByRole('button', { name: 'Start my plan', exact: true }).click();
  expect(await page.evaluate(() => typeof window.resolveBudgetPermission)).toBe('function');
}
async function root(page) { return page.evaluate(() => localStorage.getItem('daily:v1')); }

test('leaving a plan during notification permission never starts an off-screen budget', async ({ page }) => {
  await pendingPermission(page);
  await page.getByRole('link', { name: 'Home', exact: true }).click();
  const before = await root(page);
  await page.evaluate(() => window.resolveBudgetPermission('granted'));
  expect(await root(page)).toBe(before);
  await expect(page.locator('[data-widget=activities]')).not.toContainText('Focus 🌱');
  await page.goto('./#/time');
  await expect(page.locator('#setupScreen')).toBeVisible();
});

test('changing language during notification permission keeps the setup draft without starting the disposed plan', async ({ page }) => {
  await pendingPermission(page);
  await page.getByRole('button', { name: 'Español', exact: true }).click();
  await expect(page.locator('#setupScreen')).toBeVisible();
  const before = await root(page);
  await page.evaluate(() => window.resolveBudgetPermission('granted'));
  expect(await root(page)).toBe(before);
  await expect(page.locator('#taskList .task-name-input').first()).toHaveValue('Focus 🌱');
  await expect(page.getByRole('button', { name: 'Iniciar mi plan', exact: true })).toBeVisible();
});
