import { test, expect } from '@playwright/test';
import { open, plan, start, section } from './helpers.js';

test.use({ serviceWorkers: 'allow' });

async function root(page) { return page.evaluate(() => localStorage.getItem('daily:v1')); }
async function home(page) { await page.getByRole('link', { name: 'Home', exact: true }).click(); }
async function returnToTime(page) { await page.goto('./#/time'); await expect(page.locator('#timerScreen')).toBeVisible(); }

test('focus starts persist immediately and Home navigation never changes its saved timestamps', async ({ page }) => {
  await open(page);
  await start(page);
  await page.locator('#startPauseBtn').click();
  const before = await root(page);
  expect(JSON.parse(before).modules['time-budget'].data.session.timerRunning).toBe(true);
  await home(page);
  await page.clock.runFor(90000);
  await expect(page.locator('[data-widget="activities"]')).toContainText('Focus 🌱');
  await returnToTime(page);
  await expect(page.locator('#timeDisplay')).toHaveText('3:30');
  expect(await root(page)).toBe(before);
});

test('two named countdowns pause independently and remain overdue until explicit completion', async ({ page }) => {
  await open(page);
  await start(page);
  const before = await root(page);
  await section(page, 'Countdowns');
  await page.locator('.time-countdowns h2').press('Space');
  expect(await root(page)).toBe(before);
  await expect(page.locator('#timerScreen')).not.toBeVisible();
  for (const name of ['Tea ☕', 'Stretch']) {
    await page.getByLabel('Countdown name', { exact: true }).fill(name);
    await page.getByLabel('Countdown minutes', { exact: true }).fill('1');
    await page.getByRole('button', { name: 'Start countdown', exact: true }).click();
  }
  const tea = page.locator('[data-countdown]').filter({ hasText: 'Tea ☕' });
  const stretch = page.locator('[data-countdown]').filter({ hasText: 'Stretch' });
  await tea.getByRole('button', { name: 'Pause', exact: true }).click();
  await page.clock.runFor(90000);
  await expect(tea.locator('output')).toHaveText('1:00');
  await expect(stretch.locator('output')).toHaveText('+0:30');
  await expect(stretch.getByRole('button', { name: 'Complete', exact: true })).toBeVisible();
  await page.reload();
  await section(page, 'Countdowns');
  await expect(tea.getByRole('button', { name: 'Resume', exact: true })).toBeVisible();
  await stretch.getByRole('button', { name: 'Complete', exact: true }).click();
  await expect(stretch).toContainText('Completed');
  const saved = JSON.parse(await root(page));
  expect(saved.modules['time-budget'].data.session.timerRunning).toBe(false);
});

test('language changes retain added setup rows names minutes goal and template drafts', async ({ page }) => {
  await open(page);
  await plan(page);
  await page.getByRole('button', { name: 'Add task' }).click();
  const row = page.locator('#taskList .task-item').nth(2);
  await row.getByLabel('Task name').fill('Mi tarea 🌱');
  await row.getByLabel('Minutes', { exact: true }).fill('8');
  await page.locator('.template-section summary').click();
  await page.locator('#templateName').fill('Mañana');
  await page.getByRole('button', { name: 'Español', exact: true }).click();
  await expect(page.locator('#taskList .task-item')).toHaveCount(3);
  await expect(page.locator('#goalTime')).toHaveValue('13:00');
  await expect(page.locator('#taskList .task-name-input').nth(2)).toHaveValue('Mi tarea 🌱');
  await expect(page.locator('#taskList .task-duration-input').nth(2)).toHaveValue('8');
  await expect(page.locator('#templateName')).toHaveValue('Mañana');
  await expect(page.locator('#remainingAssignedTime')).toContainText('37');
});

test('pending overtime survives reload and canceled imports preserve the active plan', async ({ page }) => {
  await open(page);
  await start(page);
  await page.locator('#startPauseBtn').click();
  await page.clock.runFor(390000);
  await page.getByRole('button', { name: 'Mark done' }).click();
  await page.reload();
  await expect(page.locator('#reallocationModal')).toBeVisible();
  await expect(page.locator('#deficitAmount')).toHaveText('2 minutes');
  await page.getByRole('button', { name: 'Keep current budgets' }).click();
  const before = await root(page);
  await section(page, 'Settings');
  await page.locator('[data-time-file]').setInputFiles({ name: 'templates.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ 'New 🌱': [{ name: 'Task', minutes: 12 }] })) });
  await expect(page.locator('[data-time-import-preview]')).toBeVisible();
  expect(await root(page)).toBe(before);
  await page.getByRole('button', { name: 'Cancel import' }).click();
  expect(await root(page)).toBe(before);
  await section(page, 'Time Budget');
  await expect(page.locator('#currentTaskName')).toHaveText('Read ☕');
});

test('quota failures retain the setup draft and create no successful-looking plan', async ({ page }) => {
  await open(page);
  await plan(page);
  await page.evaluate(() => { Storage.prototype.setItem = () => { throw new Error('QuotaExceededError'); }; });
  await page.getByRole('button', { name: 'Start my plan' }).click();
  await expect(page.locator('#toast')).toContainText('QuotaExceededError');
  await expect(page.locator('#setupScreen')).toBeVisible();
  await expect(page.locator('#taskList .task-name-input').first()).toHaveValue('Focus 🌱');
  expect(await root(page)).toBeNull();
});

test('phone layout and offline reopening preserve the running budget', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page);
  await page.evaluate(async () => {
    await navigator.serviceWorker.register('./sw.js', { scope: './' });
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await start(page);
  await page.locator('#startPauseBtn').click();
  await page.context().setOffline(true);
  await home(page);
  await page.clock.runFor(90000);
  await returnToTime(page);
  await page.reload();
  await expect(page.locator('#timeDisplay')).toHaveText('3:30');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/time-budget-phone.png', fullPage: true, animations: 'disabled' });
});
