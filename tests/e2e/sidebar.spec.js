import { test, expect } from '@playwright/test';

test('shared sidebar separates app sections from app switching and keeps app colors', async ({ page }, testInfo) => {
  await page.goto('/daily/#/');
  const sidebar = page.locator('.shell-sidebar');
  await expect(sidebar).toBeVisible();
  const opener = await page.getByRole('button', { name: 'Apps', exact: true }).boundingBox();
  const brand = await page.locator('.shell-header .wordmark').boundingBox();
  expect(opener.x + opener.width).toBeLessThan(brand.x);
  const closer = await page.getByRole('button', { name: 'Collapse sidebar', exact: true }).boundingBox();
  const title = await sidebar.locator('.sidebar-brand').boundingBox();
  expect(closer.x + closer.width).toBeLessThan(title.x);
  await expect(sidebar.locator('[data-app-sections]')).toHaveCount(0);
  const switcher = await sidebar.locator('[data-app-switcher]').boundingBox();
  expect(switcher.y).toBeLessThan(130);
  await expect(sidebar.getByRole('navigation', { name: 'Apps', exact: true }).getByRole('link')).toHaveCount(7);
  const local = await page.locator('.footer-local').boundingBox();
  const system = await page.locator('.shell-footer .daily-system').boundingBox();
  expect(Math.abs(local.y - system.y)).toBeLessThan(8);
  for (const route of ['plants', 'coffee', 'coffee/history', 'games', 'games/stats', 'time', 'piano', 'reading/picker', 'reading/review', 'whatsapp']) {
    await page.goto(`/daily/#/${route}`);
    if (route === 'reading/picker') await page.getByRole('button', { name: 'Close settings', exact: true }).click();
    const before = await page.evaluate(() => localStorage.getItem('daily:v1'));
    await expect(sidebar.locator('[data-app-sections]')).toBeVisible();
    const top = await sidebar.locator('[data-app-sections]').boundingBox();
    const bottom = await sidebar.locator('[data-app-switcher]').boundingBox();
    expect(bottom.y).toBeGreaterThan(top.y + top.height);
    const color = await page.locator('.shell-main > [data-module]').evaluate(node => getComputedStyle(node).backgroundColor);
    await expect(sidebar).toHaveCSS('background-color', color);
    if (route === 'time') {
      await page.locator('#taskList .task-name-input').first().fill('Keep my draft');
      await sidebar.getByRole('button', { name: 'Countdowns', exact: true }).click();
      await expect(page.locator('.time-countdowns')).toBeInViewport();
      await expect(page.locator('#setupScreen')).not.toBeVisible();
      await expect(page.locator('.time-backup')).not.toBeVisible();
      await sidebar.getByRole('button', { name: 'Settings', exact: true }).click();
      await expect(page.locator('.time-backup')).toBeVisible();
      await expect(page.locator('.time-countdowns')).not.toBeVisible();
      await sidebar.getByRole('button', { name: 'Time Budget', exact: true }).click();
      await expect(page.locator('#setupScreen')).toBeVisible();
      await expect(page.locator('#taskList .task-name-input').first()).toHaveValue('Keep my draft');
      await page.locator('.template-section summary').click();
      await expect(page.locator('.template-section')).toHaveAttribute('open', '');
    }
    if (route === 'whatsapp') {
      await sidebar.getByRole('button', { name: 'Draft backup', exact: true }).click();
      await expect(page.locator('.whatsapp-backup')).toBeInViewport();
    }
    expect(await page.evaluate(() => localStorage.getItem('daily:v1'))).toBe(before);
    await expect(page.locator('.shell-footer .daily-system')).toHaveCount(1);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: testInfo.outputPath('sidebar-desktop.png'), fullPage: true });
  await page.evaluate(() => {
    localStorage.setItem('daily:v1', '{broken');
    window.dispatchEvent(new StorageEvent('storage', { key: 'daily:v1' }));
  });
  await expect(page.getByRole('heading', { name: 'Local data needs attention', exact: true })).toBeVisible();
  await expect(page.locator('body > .daily-system')).toHaveCount(1);
});

test('desktop sidebar collapses without remounting the app or losing a draft', async ({ page }) => {
  await page.goto('/daily/#/whatsapp');
  await page.locator('#recipient').fill('Draft contact');
  const before = await page.evaluate(() => localStorage.getItem('daily:v1'));
  await page.getByRole('button', { name: 'Collapse sidebar', exact: true }).click();
  await expect(page.locator('.shell-sidebar')).not.toBeVisible();
  await page.getByRole('button', { name: 'Apps', exact: true }).click();
  await expect(page.locator('.shell-sidebar')).toBeVisible();
  await expect(page.locator('#recipient')).toHaveValue('Draft contact');
  expect(await page.evaluate(() => localStorage.getItem('daily:v1'))).toBe(before);
});

test('phone drawer traps focus closes with escape and navigates without overflow', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('/daily/#/plants');
  const sidebar = page.locator('.shell-sidebar');
  const toggle = page.getByRole('button', { name: 'Apps', exact: true });
  await expect(sidebar).not.toBeVisible();
  await toggle.click();
  await expect(sidebar).toHaveAttribute('aria-modal', 'true');
  await expect(page.getByRole('button', { name: 'Close menu', exact: true })).toBeFocused();
  await page.screenshot({ path: testInfo.outputPath('sidebar-phone.png') });
  await page.keyboard.press('Shift+Tab');
  expect(await sidebar.evaluate(node => node.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(sidebar).not.toBeVisible();
  await expect(toggle).toBeFocused();
  await toggle.click();
  await sidebar.locator('[data-app-sections]').getByRole('link', { name: 'Add plant', exact: true }).click();
  await expect(page).toHaveURL(/#\/plants\/new$/);
  await expect(sidebar).not.toBeVisible();
  await page.getByLabel('Plant name', { exact: true }).fill('Unsaved fern');
  await toggle.click();
  await sidebar.locator('[data-app-sections]').getByRole('link', { name: 'Add plant', exact: true }).click();
  await expect(sidebar).not.toBeVisible();
  await expect(page.getByLabel('Plant name', { exact: true })).toHaveValue('Unsaved fern');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await toggle.click();
  await page.locator('.sidebar-backdrop').click({ position: { x: 310, y: 100 } });
  await expect(sidebar).not.toBeVisible();
  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(sidebar).toBeVisible();
  await page.setViewportSize({ width: 320, height: 740 });
  await expect(sidebar).not.toBeVisible();
});
