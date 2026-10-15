import { test, expect } from '@playwright/test';

import { open, plan, start } from './helpers.js';

test('setup is read-only and shows available and assigned minutes', async ({ page }) => {
  await open(page);
  await plan(page);
  await expect(page.locator('#remainingAssignedTime')).toContainText('45');
  expect(await page.evaluate(() => localStorage.getItem('daily:v1') ?? localStorage.getItem('timeBudget_currentState'))).toBeNull();
});

test('overallocated plans remain editable and do not start', async ({ page }) => {
  await open(page);
  await plan(page);
  await page.locator('#taskList .task-duration-input').first().fill('55');
  await page.getByRole('button', { name: 'Start my plan' }).click();
  await expect(page.locator('#setupScreen')).toBeVisible();
  await expect(page.locator('#toast')).toContainText('over');
});

test('task order is editable and a plan starts with a paused first task', async ({ page }) => {
  await open(page);
  await plan(page);
  await page.locator('#taskList .task-item').nth(1).getByRole('button', { name: 'Move task up' }).click();
  await page.getByRole('button', { name: 'Start my plan' }).click();
  await expect(page.locator('#currentTaskName')).toHaveText('Read ☕');
  await expect(page.locator('#startPauseBtn')).toHaveText('Start focus');
  await expect(page.locator('#timeDisplay')).toHaveText('10:00');
});

test('running focus restores timestamp elapsed after reload and paused focus stays paused', async ({ page }) => {
  await open(page);
  await start(page);
  await page.locator('#startPauseBtn').click();
  await page.clock.runFor(90000);
  await page.reload();
  await expect(page.locator('#startPauseBtn')).toHaveText('Pause focus');
  await expect(page.locator('#timeDisplay')).toHaveText('3:30');
  await page.locator('#startPauseBtn').click();
  await page.clock.runFor(60000);
  await page.reload();
  await expect(page.locator('#startPauseBtn')).toHaveText('Resume focus');
  await expect(page.locator('#timeDisplay')).toHaveText('3:30');
});

test('overtime stays active until explicit completion and accepts exact rounded reallocation', async ({ page }) => {
  await open(page);
  await start(page);
  await page.locator('#startPauseBtn').click();
  await page.clock.runFor(390000);
  await expect(page.locator('#timeDisplay')).toHaveText('+1:30');
  await expect(page.locator('#currentTaskName')).toHaveText('Focus 🌱');
  await page.getByRole('button', { name: 'Mark done' }).click();
  await expect(page.locator('#reallocationModal')).toBeVisible();
  await expect(page.locator('#deficitAmount')).toHaveText('2 minutes');
  await page.locator('.realloc-input').fill('1');
  await expect(page.locator('#applyReallocBtn')).toBeDisabled();
  await page.locator('.realloc-input').fill('2');
  await page.locator('#applyReallocBtn').click();
  await expect(page.locator('#currentTaskName')).toHaveText('Read ☕');
  await expect(page.locator('#allocatedTime')).toHaveText('8 minutes');
});

test('keeping budgets advances and editing the plan retains task names and allocations', async ({ page }) => {
  await open(page);
  await start(page);
  await page.locator('#startPauseBtn').click();
  await page.clock.runFor(360000);
  await page.getByRole('button', { name: 'Mark done' }).click();
  await page.getByRole('button', { name: 'Keep current budgets' }).click();
  await expect(page.locator('#allocatedTime')).toHaveText('10 minutes');
  await page.getByRole('button', { name: 'Edit this session' }).click();
  await expect(page.locator('#goalTime')).toHaveValue('13:00');
  await expect(page.locator('#taskList .task-name-input').first()).toHaveValue('Focus 🌱');
});

test('templates save load and export the original name-to-task format', async ({ page }) => {
  await open(page);
  await plan(page);
  await page.getByText('Templates', { exact: true }).click();
  await page.locator('#templateName').fill('Mañana 🌱');
  await page.getByRole('button', { name: 'Save current plan' }).click();
  await expect(page.locator('#templateSelect')).toHaveValue('Mañana 🌱');
  await page.locator('#taskList .task-name-input').first().fill('Changed');
  await page.locator('#templateSelect').selectOption('');
  await page.locator('#templateSelect').selectOption('Mañana 🌱');
  await expect(page.locator('#taskList .task-name-input').first()).toHaveValue('Focus 🌱');
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export templates' }).click();
  const download = await pending;
  expect(download.suggestedFilename()).toBe('timeBudget-templates.json');
});

test('task completion advances once and finishing returns to the retained setup', async ({ page }) => {
  await open(page);
  await start(page);
  await page.getByRole('button', { name: 'Mark done' }).click();
  await expect(page.locator('#currentTaskName')).toHaveText('Read ☕');
  await page.getByRole('button', { name: 'Mark done' }).click();
  await expect(page.locator('#setupScreen')).toBeVisible();
  await expect(page.locator('#taskList .task-name-input').nth(1)).toHaveValue('Read ☕');
});
