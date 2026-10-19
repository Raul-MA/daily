import { expect } from '@playwright/test';

export async function open(page) {
  await page.clock.install({ time: new Date(2026, 9, 15, 12, 0) });
  await page.clock.pauseAt(new Date(2026, 9, 15, 12, 0));
  await page.goto(process.env.DAILY_BASELINE_URL || './#/time');
  await expect(page.locator('#setupScreen')).toBeVisible();
}
export async function plan(page) {
  await page.locator('#goalTime').fill('13:00');
  const rows = page.locator('#taskList .task-item');
  await rows.nth(0).getByLabel('Task name').fill('Focus 🌱');
  await rows.nth(0).getByLabel('Minutes', { exact: true }).fill('5');
  await rows.nth(1).getByLabel('Task name').fill('Read ☕');
  await rows.nth(1).getByLabel('Minutes', { exact: true }).fill('10');
}
export async function start(page) {
  await plan(page);
  await page.getByRole('button', { name: 'Start my plan' }).click();
  await expect(page.locator('#timerScreen')).toBeVisible();
}


export async function section(page, name) {
  const sidebar = page.locator('.shell-sidebar');
  if (!await sidebar.isVisible()) await page.locator('[data-sidebar-toggle]').click();
  await sidebar.locator('[data-app-sections]').getByRole('button', { name, exact: true }).click();
}
