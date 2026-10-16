import { test, expect } from '@playwright/test';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { createDailyState } from '../../packages/data/src/daily-state.js';
import { connectReading } from '../../modules/reading/src/service.js';

async function sourcePage(page) {
  const names = ['index.html', 'entry.js', 'export.js', 'validation.js', 'config.js', 'metadata.js'];
  for (const name of names) expect(existsSync(resolve('legacy/exporters/reader', name)), name).toBe(true);
  await page.route('**/legacy-reader-export/**', route => {
    const name = new URL(route.request().url()).pathname.split('/').pop();
    if (!names.includes(name)) return route.abort();
    return route.fulfill({ body: readFileSync(resolve('legacy/exporters/reader', name)), contentType: name.endsWith('.html') ? 'text/html' : 'text/javascript' });
  });
  await page.addInitScript(() => {
    localStorage.setItem('readerPicker.settings.v2', JSON.stringify({ count: 5, minutes: 15, rememberLastItem: true, token: 'fixture-private-token' }));
    localStorage.setItem('readerPicker.lastItem.v1', JSON.stringify({ id: 'doc-1', title: 'Artículo <b>🌱</b>', url: 'https://read.readwise.io/read/doc-1', body: 'fixture-private-body' }));
    localStorage.setItem('readerPicker.token.pwa.v1', 'fixture-private-token');
    localStorage.setItem('readerPicker.cache.v2', 'fixture-private-cache');
  });
  await page.goto('/legacy-reader-export/index.html');
}
async function contents(download) {
  let value = '';
  for await (const chunk of await download.createReadStream()) value += chunk.toString();
  return value;
}
function importIntoDaily(file) {
  const values = new Map();
  const port = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
  const service = connectReading(createDailyState(port), { storage: port, sessionStorage: port, fetch: () => { throw new Error('Migration called the API'); } });
  try { service.applyImport(service.previewImport(file)); return service.read(); }
  finally { service.stop(); }
}

test('legacy Reader export previews optional remembered metadata and imports preferences without credentials or cached bodies', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 760 });
  await sourcePage(page);
  const before = await page.evaluate(() => Object.entries(localStorage));
  await expect(page.locator('#download')).toBeDisabled();
  await page.locator('#preview').click();
  await expect(page.locator('#counts')).toContainText('5');
  await expect(page.locator('#remembered')).toContainText('Artículo <b>🌱</b>');
  await expect(page.locator('#remembered b')).toHaveCount(0);
  await page.locator('#language').selectOption('es');
  await expect(page.getByRole('heading', { name: 'Exportar Reader para Daily' })).toBeVisible();
  const pending = page.waitForEvent('download');
  await page.locator('#download').click();
  const file = await contents(await pending);
  for (const secret of ['fixture-private-token', 'fixture-private-cache', 'fixture-private-body']) expect(file).not.toContain(secret);
  const data = importIntoDaily(file);
  expect(data.settings.count).toBe(5);
  expect(data.settings.minutes).toBe(15);
  expect(data.lastItem.id).toBe('doc-1');
  expect(await page.evaluate(() => Object.entries(localStorage))).toEqual(before);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.evaluate(() => localStorage.setItem('readerPicker.settings.v2', '{broken'));
  await page.locator('#preview').click();
  await expect(page.locator('#status')).toContainText(/no son válidos|no se pudieron/i);
  await expect(page.locator('#download')).toBeDisabled();
  expect(await page.evaluate(() => localStorage.getItem('readerPicker.settings.v2'))).toBe('{broken');
});
