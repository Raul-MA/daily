import { test, expect } from '@playwright/test';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { createDailyState } from '../../packages/data/src/daily-state.js';
import { connectTimeBudget } from '../../modules/time-budget/src/service.js';

function originalSession() {
  return { goalTime: '13:00', startTime: 1792065600000, currentTaskIndex: 0, timerRunning: true, timerStartTime: 1792065600000, timerElapsed: 0,
    tasks: [{ id: 7, name: 'Leer 🌱', allocatedMinutes: 5, actualMinutes: null, status: 'active' }] };
}
async function sourcePage(page) {
  for (const name of ['index.html', 'entry.js', 'export.js', 'validation.js']) expect(existsSync(resolve('legacy/exporters/time-budget', name)), name).toBe(true);
  await page.route('**/legacy-budget-export/**', route => {
    const name = new URL(route.request().url()).pathname.split('/').pop();
    if (!['index.html', 'entry.js', 'export.js', 'validation.js'].includes(name)) return route.abort();
    return route.fulfill({ body: readFileSync(resolve('legacy/exporters/time-budget', name)), contentType: name.endsWith('.html') ? 'text/html' : 'text/javascript' });
  });
  await page.addInitScript(session => {
    localStorage.setItem('timeBudget_currentState', JSON.stringify(session));
    localStorage.setItem('timeBudget_templates', JSON.stringify({ 'Mañana ☕': [{ name: 'Leer 🌱', minutes: 5 }] }));
    localStorage.setItem('unrelated-credentials', 'fixture-private-token');
  }, originalSession());
  await page.goto('/legacy-budget-export/index.html');
}
async function contents(download) {
  let value = '';
  for await (const chunk of await download.createReadStream()) value += chunk.toString();
  return value;
}
function daily() {
  const values = new Map();
  return connectTimeBudget(createDailyState({ getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) }));
}

test('legacy Time Budget exporter previews and downloads original active timing without changing source storage', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 760 });
  await sourcePage(page);
  const before = await page.evaluate(() => Object.entries(localStorage));
  await expect(page.locator('#download')).toBeDisabled();
  await page.locator('#preview').click();
  await expect(page.locator('#counts')).toContainText('1');
  await page.locator('#language').selectOption('es');
  await expect(page.getByRole('heading', { name: 'Exportar Time Budget para Daily' })).toBeVisible();
  const pending = page.waitForEvent('download');
  await page.locator('#download').click();
  const file = await contents(await pending);
  expect(file).not.toContain('fixture-private-token');
  const target = daily();
  target.applyImport(target.previewImport(file));
  expect(target.read().session.timerStartTime).toBe(originalSession().timerStartTime);
  expect(target.read().session.tasks[0].name).toBe('Leer 🌱');
  expect(await page.evaluate(() => Object.entries(localStorage))).toEqual(before);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.evaluate(() => localStorage.setItem('timeBudget_currentState', '{broken'));
  await page.locator('#preview').click();
  await expect(page.locator('#status')).toContainText(/no son válidos|no se pudieron/i);
  await expect(page.locator('#download')).toBeDisabled();
  expect(await page.evaluate(() => localStorage.getItem('timeBudget_currentState'))).toBe('{broken');
});
