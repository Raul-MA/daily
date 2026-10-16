import { test, expect } from '@playwright/test';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { createDailyState } from '../../packages/data/src/daily-state.js';
import { connectWhatsApp } from '../../modules/whatsapp/src/service.js';

const draft = { recipient: 'Café 👋', date: '2026-10-08', time: '09:00', message: '你好 <b>🌱</b>\nA&B + 100%' };
async function sourcePage(page) {
  const names = ['index.html', 'entry.js', 'export.js', 'validation.js'];
  for (const name of names) expect(existsSync(resolve('legacy/exporters/whatsapp', name)), name).toBe(true);
  await page.route('**/legacy-whatsapp-export/**', route => {
    const name = new URL(route.request().url()).pathname.split('/').pop();
    if (!names.includes(name)) return route.abort();
    return route.fulfill({ body: readFileSync(resolve('legacy/exporters/whatsapp', name)), contentType: name.endsWith('.html') ? 'text/html' : 'text/javascript' });
  });
  await page.addInitScript(value => {
    localStorage.setItem('whatsapp-later-draft', JSON.stringify(value));
    localStorage.setItem('unrelated-credentials', 'fixture-private-token');
  }, draft);
  await page.goto('/legacy-whatsapp-export/index.html');
}
async function contents(download) {
  let value = '';
  for await (const chunk of await download.createReadStream()) value += chunk.toString();
  return value;
}
function importIntoDaily(file) {
  const values = new Map();
  const service = connectWhatsApp(createDailyState({ getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) }));
  service.applyImport(service.previewImport(file));
  return service.read().draft;
}

test('legacy WhatsApp export preserves expired reminder fields and safe literal message text without handoff or storage changes', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 760 });
  await sourcePage(page);
  const before = await page.evaluate(() => Object.entries(localStorage));
  await expect(page.locator('#download')).toBeDisabled();
  await page.locator('#preview').click();
  await expect(page.locator('#counts')).toContainText('1');
  await expect(page.locator('#draft-message')).toContainText('你好 <b>🌱</b>');
  await expect(page.locator('#draft-message b')).toHaveCount(0);
  await expect(page.locator('#draft-time')).toContainText('2026-10-08 09:00');
  await page.locator('#language').selectOption('es');
  await expect(page.getByRole('heading', { name: 'Exportar WhatsApp para Daily' })).toBeVisible();
  const pending = page.waitForEvent('download');
  await page.locator('#download').click();
  const file = await contents(await pending);
  expect(file).not.toContain('fixture-private-token');
  expect(importIntoDaily(file)).toEqual(draft);
  expect(await page.evaluate(() => Object.entries(localStorage))).toEqual(before);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.evaluate(() => localStorage.setItem('whatsapp-later-draft', '{broken'));
  await page.locator('#preview').click();
  await expect(page.locator('#status')).toContainText(/no son válidos|no se pudieron/i);
  await expect(page.locator('#download')).toBeDisabled();
  expect(await page.evaluate(() => localStorage.getItem('whatsapp-later-draft'))).toBe('{broken');
});
