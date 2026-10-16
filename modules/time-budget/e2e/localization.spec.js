import { test, expect } from '@playwright/test';
import { open, plan, start } from './helpers.js';

test.use({ serviceWorkers: 'allow' });

async function moduleData(page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem('daily:v1'))?.modules['time-budget'] ?? null);
}

test('time budget Spanish setup countdowns and backup controls work offline without rewriting draft text', async ({ page, context }) => {
  await open(page);
  await plan(page);
  await page.locator('#taskList .task-name-input').first().fill('Free time remaining 🌱');
  await page.getByRole('button', { name: 'Español', exact: true }).click();
  await expect(page.locator('#setupTitle')).toHaveText('Haz que cada minuto cuente.');
  await expect(page.locator('#taskList .task-name-input').first()).toHaveValue('Free time remaining 🌱');
  await expect(page.getByLabel('Nombre de la cuenta atrás', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Exportar Time Budget completo', exact: true })).toBeVisible();
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) await new Promise(resolve => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true }));
  });
  expect(await moduleData(page)).toBeNull();
  await context.setOffline(true);
  await page.reload();
  await page.setViewportSize({ width: 320, height: 740 });
  await expect(page.locator('#setupTitle')).toHaveText('Haz que cada minuto cuente.');
  await expect(page.getByLabel('Hora de finalización', { exact: true })).toBeVisible();
  const wide = await page.evaluate(() => Array.from(document.querySelectorAll('[data-module="time-budget"] *')).filter(node => node.getBoundingClientRect().right > innerWidth + 1).map(node => ({ tag: node.tagName, id: node.id, className: node.className, width: node.getBoundingClientRect().width })));
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), JSON.stringify(wide)).toBe(true);
  expect(await moduleData(page)).toBeNull();
  await page.locator('[data-time-file]').setInputFiles({ name: 'future.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ app: 'time-budget', schemaVersion: 99 })) });
  await expect(page.locator('#toast')).toContainText('La versión del esquema de Time Budget no es compatible.');
  await page.getByRole('button', { name: 'Cancelar importación', exact: true }).click();
  await expect(page.locator('[data-time-file]')).toHaveValue('');
  await expect(page.locator('[data-time-import-preview]')).toBeHidden();
  expect(await moduleData(page)).toBeNull();
});

test('time budget running clocks queue drafts and overtime controls translate without changing saved timing', async ({ page }) => {
  await open(page);
  await start(page);
  await page.locator('#startPauseBtn').click();
  await page.getByRole('button', { name: 'Edit Read ☕', exact: true }).click();
  await page.locator('#remainingTasksList .task-name-input').fill('Draft 🌱');
  const before = await moduleData(page);
  await page.getByRole('button', { name: 'Español', exact: true }).click();
  await expect(page.locator('#remainingTasksList .task-name-input')).toHaveValue('Draft 🌱');
  await expect(page.getByRole('button', { name: 'Guardar cambios', exact: true })).toBeVisible();
  await expect(page.locator('#startPauseBtn')).toHaveText('Pausar enfoque');
  await page.clock.runFor(90000);
  await expect(page.locator('#timeDisplay')).toHaveText('3:30');
  expect(await moduleData(page)).toEqual(before);
  await page.getByRole('button', { name: 'Cancelar edición', exact: true }).click();
  await page.clock.runFor(300000);
  await page.getByRole('button', { name: 'Marcar como hecha', exact: true }).click();
  await expect(page.locator('#reallocationTitle')).toHaveText('Esta tarea se alargó');
  await expect(page.locator('#deficitAmount')).toHaveText('2 minutos');
  await page.locator('.realloc-input').fill('2');
  await expect(page.locator('#reallocSummary')).toContainText('coincide con el exceso');
  await page.getByRole('button', { name: 'Aplicar cambios', exact: true }).click();
  await expect(page.locator('#currentTaskName')).toHaveText('Read ☕');
  expect((await moduleData(page)).data.session.tasks[1].allocatedMinutes).toBe(8);
});

test('time budget notifications translate through remounts and keep their original expiry', async ({ page }) => {
  await open(page);
  await page.getByRole('button', { name: 'Start my plan', exact: true }).click();
  await expect(page.locator('#toast')).toHaveText('Choose a finish time first.');
  await page.clock.fastForward(2000);
  await page.getByRole('button', { name: 'Español', exact: true }).click();
  await expect(page.locator('#toast')).toHaveText('Elige primero una hora de finalización.');
  await page.clock.fastForward(1300);
  await expect(page.locator('#toast')).toBeHidden();
  await page.getByRole('button', { name: 'English', exact: true }).click();
  await expect(page.locator('#toast')).toBeHidden();
});

test('time budget ignores a slow previous backup after a newer file selection or cancel', async ({ page }) => {
  await open(page);
  await page.evaluate(() => {
    const original = File.prototype.text;
    File.prototype.text = function () {
      const result = original.call(this);
      if (this.name !== 'slow.json') return result;
      return new Promise(resolve => { window.releaseTimeFile = () => result.then(resolve); });
    };
  });
  const input = page.locator('[data-time-file]');
  await input.setInputFiles({ name: 'slow.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ Old: [{ name: 'Old', minutes: 1 }] })) });
  await expect.poll(() => page.evaluate(() => typeof window.releaseTimeFile)).toBe('function');
  await input.setInputFiles({ name: 'future.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ app: 'time-budget', schemaVersion: 99 })) });
  await expect(page.locator('#toast')).toContainText('Unsupported Time Budget schema version.');
  await page.evaluate(async () => { await window.releaseTimeFile(); });
  await expect(page.locator('[data-time-import-preview] p')).toHaveText('This backup could not be imported.');
  await expect(page.locator('[data-time-confirm]')).toBeDisabled();
  await page.getByRole('button', { name: 'Cancel import', exact: true }).click();
  await expect(input).toHaveValue('');
  await input.setInputFiles({ name: 'slow.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ Cancelled: [{ name: 'Cancel', minutes: 1 }] })) });
  await expect(page.locator('[data-time-import-preview] p')).toHaveText('Reading backup…');
  await page.getByRole('button', { name: 'Cancel import', exact: true }).click();
  await page.evaluate(async () => { await window.releaseTimeFile(); });
  await expect(page.locator('[data-time-import-preview]')).toBeHidden();
  await expect(input).toHaveValue('');
  expect(await moduleData(page)).toBeNull();
});
