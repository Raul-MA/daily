import { test, expect } from '@playwright/test';
import { open, start } from './helpers.js';

test('negative and fractional reallocation never enable confirmation', async ({ page }) => {
  await open(page);
  await start(page);
  await page.getByRole('button', { name: 'Add another task' }).click();
  const form = page.locator('.add-task-form');
  await form.getByLabel('Task name').fill('Walk');
  await form.getByLabel('Minutes', { exact: true }).fill('5');
  await form.getByRole('button', { name: 'Save new task' }).click();
  await page.locator('#startPauseBtn').click();
  await page.clock.runFor(390000);
  await page.getByRole('button', { name: 'Mark done' }).click();
  await page.locator('.realloc-input').nth(0).fill('-1');
  await page.locator('.realloc-input').nth(1).fill('3');
  await expect(page.locator('#applyReallocBtn')).toBeDisabled();
  await page.locator('.realloc-input').nth(0).fill('1.5');
  await page.locator('.realloc-input').nth(1).fill('1');
  await expect(page.locator('#applyReallocBtn')).toBeDisabled();
});

test('queue drafts survive language changes and stale edits cannot overwrite another view', async ({ page }) => {
  await open(page);
  await start(page);
  await page.getByRole('button', { name: 'Edit Read ☕', exact: true }).click();
  await page.locator('#remainingTasksList .task-name-input').fill('Draft 🌱');
  await page.getByRole('button', { name: 'Español', exact: true }).click();
  await expect(page.locator('#remainingTasksList .task-name-input')).toHaveValue('Draft 🌱');
  const other = await page.evaluate(() => {
    const old = localStorage.getItem('daily:v1');
    const root = JSON.parse(old);
    root.modules['time-budget'].data.session.tasks[1].name = 'Other view';
    const next = JSON.stringify(root);
    localStorage.setItem('daily:v1', next);
    window.dispatchEvent(new StorageEvent('storage', { key: 'daily:v1', oldValue: old, newValue: next }));
    return next;
  });
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.locator('#toast')).toContainText('changed');
  await expect(page.locator('#remainingTasksList .task-name-input')).toHaveValue('Draft 🌱');
  expect(await page.evaluate(() => localStorage.getItem('daily:v1'))).toBe(other);
});

test('confirmed legacy imports preserve active sessions and create a full recovery backup', async ({ page }) => {
  await open(page);
  await start(page);
  await expect(page.getByLabel('Import Time Budget backup')).toBeVisible();
  await page.locator('[data-time-file]').setInputFiles({ name: 'templates.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ 'Mañana 🌱': [{ name: 'Café', minutes: 12 }] })) });
  await expect(page.locator('[data-time-confirm]')).toBeDisabled();
  const download = page.waitForEvent('download');
  await page.locator('[data-time-recovery]').click();
  expect((await download).suggestedFilename()).toBe('daily-recovery.json');
  await page.locator('[data-time-confirm]').click();
  await expect(page.locator('[data-time-import-preview]')).toBeHidden();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('daily:v1')));
  expect(saved.modules['time-budget'].data.templates['Mañana 🌱'][0].name).toBe('Café');
  expect(saved.modules['time-budget'].data.session.tasks[0].name).toBe('Focus 🌱');
  expect(await page.evaluate(() => localStorage.getItem('daily:v1:recovery'))).toBeTruthy();
});
