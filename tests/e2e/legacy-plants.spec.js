import { test, expect } from '@playwright/test';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { createDailyState } from '../../packages/data/src/daily-state.js';
import { connectPlants } from '../../modules/plants/src/service.js';
import { makeDocument } from '../../modules/plants/src/store/envelope.js';

const record = { id: 'fern-1', name: 'Helecho 🌱', dateAdded: '2026-07-01T12:00:00Z', schedule: { wateringIntervalDays: 7 }, careLog: [] };
async function sourcePage(page) {
  const names = ['index.html', 'entry.js', 'export.js', 'validation.js', 'constants.js', 'envelope.js'];
  for (const name of names) expect(existsSync(resolve('legacy/exporters/plants', name)), name).toBe(true);
  await page.route('**/legacy-plants-export/**', route => {
    const name = new URL(route.request().url()).pathname.split('/').pop();
    if (!names.includes(name)) return route.abort();
    return route.fulfill({ body: readFileSync(resolve('legacy/exporters/plants', name)), contentType: name.endsWith('.html') ? 'text/html' : 'text/javascript' });
  });
  await page.addInitScript(snapshot => {
    localStorage.setItem('plantTracker_plants', snapshot);
    localStorage.setItem('stillgreen_things_settings', JSON.stringify({ enabled: true, project: 'Casa 🪴' }));
    localStorage.setItem('unrelated-credentials', 'fixture-private-token');
  }, JSON.stringify(makeDocument([record])));
  await page.goto('/legacy-plants-export/index.html');
}
async function contents(download) {
  let value = '';
  for await (const chunk of await download.createReadStream()) value += chunk.toString();
  return value;
}
function importIntoDaily(file) {
  const values = new Map();
  const state = createDailyState({ getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) });
  const service = connectPlants(state);
  try { service.applyImport(service.previewImport(file)); return state.read().value.modules.plants.data; }
  finally { service.stop(); }
}

test('legacy plant exporter preserves plant records and Things preferences through phone preview and Daily import', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 760 });
  await sourcePage(page);
  const before = await page.evaluate(() => Object.entries(localStorage));
  await expect(page.locator('#download')).toBeDisabled();
  await page.locator('#preview').click();
  await expect(page.locator('#counts')).toContainText('1');
  await expect(page.locator('#project')).toContainText('Casa 🪴');
  await page.locator('#language').selectOption('es');
  await expect(page.getByRole('heading', { name: 'Exportar plantas para Daily' })).toBeVisible();
  const pending = page.waitForEvent('download');
  await page.locator('#download').click();
  const file = await contents(await pending);
  expect(file).not.toContain('fixture-private-token');
  const data = importIntoDaily(file);
  expect(data.plants).toEqual([record]);
  expect(data.things).toEqual({ enabled: true, project: 'Casa 🪴' });
  expect(await page.evaluate(() => Object.entries(localStorage))).toEqual(before);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.evaluate(() => {
    localStorage.setItem('plantTracker_plants_pending', localStorage.getItem('plantTracker_plants'));
    localStorage.setItem('plantTracker_plants', '{broken');
  });
  await page.locator('#preview').click();
  await expect(page.locator('#recovery')).toBeVisible();
  await expect(page.locator('#download')).toBeEnabled();
  expect(await page.evaluate(() => localStorage.getItem('plantTracker_plants'))).toBe('{broken');
});
