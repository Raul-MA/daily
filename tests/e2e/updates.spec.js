import { test, expect } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';

test.use({ serviceWorkers: 'allow' });

async function controlled(page, route = '') {
  await page.goto(`/daily/#/${route}`);
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller)), { timeout: 10000 }).toBe(true);
}

async function dirtyForm(page) {
  await page.locator('main').evaluate(main => {
    const form = document.createElement('form');
    form.id = 'update-test-form';
    const input = document.createElement('input');
    input.setAttribute('aria-label', 'Unfinished work');
    form.append(input);
    main.append(form);
  });
  await page.getByRole('textbox', { name: 'Unfinished work' }).fill('Keep this until saved');
}

test('updates wait for unsaved work in another tab and then preserve settings across activation', async ({ page, context }) => {
  await controlled(page, 'settings');
  await page.getByRole('button', { name: 'English', exact: true }).click();
  const saved = await page.evaluate(() => localStorage.getItem('daily:v1'));
  const other = await context.newPage();
  await controlled(other);
  await dirtyForm(page);
  const original = readFileSync('dist/sw.js', 'utf8');
  try {
    writeFileSync('dist/sw.js', original.replace(/daily-pwa-([a-f0-9]+)/, 'daily-pwa-$1-upgrade'));
    await other.evaluate(async () => { await (await navigator.serviceWorker.ready).update(); });
    const apply = other.getByRole('button', { name: 'Apply update', exact: true });
    await expect(apply).toBeVisible();
    await expect(page.getByRole('button', { name: 'Apply update', exact: true })).toBeDisabled();
    await apply.click();
    await expect(other.locator('.daily-system')).toContainText('all open Daily tabs');
    expect(await other.evaluate(async () => Boolean((await navigator.serviceWorker.ready).waiting))).toBe(true);
    await expect(page.getByRole('textbox', { name: 'Unfinished work' })).toHaveValue('Keep this until saved');
    await page.locator('#update-test-form').evaluate(form => { form.dataset.unsaved = 'false'; });
    await Promise.all([page.waitForEvent('load'), other.waitForEvent('load'), apply.click()]);
    expect(await other.evaluate(async () => Boolean((await navigator.serviceWorker.ready).waiting))).toBe(false);
    await expect(other.getByRole('heading', { name: 'Today', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Settings', exact: true })).toBeVisible();
    expect(await other.evaluate(() => localStorage.getItem('daily:v1'))).toBe(saved);
  } finally {
    writeFileSync('dist/sw.js', original);
  }
});
