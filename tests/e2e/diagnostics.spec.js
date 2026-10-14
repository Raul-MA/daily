import { test, expect } from '@playwright/test';

const open = page => page.goto('/daily/diagnostics.html');

test('connection checks require submission and preserve unrelated storage', async ({ page }) => {
  const requests = [];
  await page.route('https://readwise.io/**', async route => {
    requests.push(route.request());
    const status = route.request().url().includes('/auth/') ? 204 : 200;
    await route.fulfill({ status, body: status === 204 ? '' : '{"text":"private fixture content"}' });
  });
  await open(page);
  await page.evaluate(() => localStorage.setItem('unrelated-app', 'preserve'));
  expect(requests).toHaveLength(0);
  await page.getByLabel('Readwise token').fill('fixture-token');
  await page.getByRole('button', { name: 'Run checks' }).click();
  await expect(page.getByLabel('Readwise token')).toHaveValue('');
  await expect(page.getByRole('status')).toHaveText('Checks finished.');
  expect(requests).toHaveLength(3);
  expect(requests.every(request => request.method() === 'GET')).toBe(true);
  await expect(page.locator('tbody')).toContainText('Available');
  await expect(page.locator('body')).not.toContainText('private fixture content');
  await expect(page.locator('#origin')).toContainText('Local or different origin');
  expect(await page.evaluate(() => ({ ...localStorage }))).toEqual({ 'unrelated-app': 'preserve' });
  expect(await page.evaluate(() => sessionStorage.length)).toBe(0);
});

test('a missing review and a Reader network failure do not hide other outcomes', async ({ page }) => {
  await page.route('https://readwise.io/**', async route => {
    const url = route.request().url();
    if (url.includes('/list/')) return route.abort('failed');
    await route.fulfill({ status: url.includes('/auth/') ? 204 : 404 });
  });
  await open(page);
  await page.getByLabel('Readwise token').fill('fixture-token');
  await page.getByRole('button', { name: 'Run checks' }).click();
  await expect(page.getByRole('status')).toHaveText('Checks finished.');
  await expect(page.locator('tbody')).toContainText('Network or CORS failure');
  await expect(page.locator('tbody')).toContainText('No review available');
  await expect(page.getByRole('link', { name: 'Open Daily Review' })).toHaveAttribute('href', 'https://readwise.io/dailyreview');
});

test('diagnostic controls and outcomes support Spanish', async ({ page }) => {
  await page.route('https://readwise.io/**', route => route.fulfill({ status: 401 }));
  await open(page);
  await page.getByLabel('Language').selectOption('es');
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await page.getByLabel('Token de Readwise').fill('fixture-token');
  await page.getByRole('button', { name: 'Comprobar conexión' }).click();
  await expect(page.getByRole('status')).toHaveText('Comprobaciones terminadas.');
  await expect(page.locator('tbody')).toContainText('Sin autorización');
});
