import { test, expect } from '@playwright/test';

async function open(page) { await page.goto('./#/whatsapp'); await expect(page.locator('#composer')).toBeVisible(); }
async function compose(page) {
  await page.locator('#recipient').fill('Family & friends');
  await page.locator('#message').fill('Café 👋\nA&B + 100% #yes');
}
async function root(page) { return page.evaluate(() => JSON.parse(localStorage.getItem('daily:v1'))); }

test('WhatsApp draft autosaves and survives Home reload and language changes without translating user text', async ({ page }) => {
  await open(page);
  await compose(page);
  const saved = (await root(page)).modules.whatsapp.data.draft;
  await page.getByRole('link', { name: 'Home', exact: true }).click();
  await page.goto('./#/whatsapp');
  await page.reload();
  await expect(page.locator('#message')).toHaveValue(saved.message);
  await expect(page.locator('#date')).toHaveValue(saved.date);
  await page.getByRole('button', { name: 'Español', exact: true }).click();
  await expect(page.locator('#create')).toContainText('Crear en Things');
  await expect(page.locator('#recipient')).toHaveValue(saved.recipient);
  expect((await root(page)).modules.whatsapp.data.draft).toEqual(saved);
});

test('WhatsApp Things handoff clears the saved draft before navigation and preserves the exact copy fallback', async ({ page }) => {
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await open(page);
  await compose(page);
  const saved = (await root(page)).modules.whatsapp.data.draft;
  await page.locator('#create').click();
  await expect(page.locator('#recipient')).toHaveValue('');
  await expect(page.locator('#message')).toHaveValue('');
  expect((await root(page)).modules.whatsapp.data.draft).toBeNull();
  await expect(page.locator('#copy')).toBeEnabled();
  await page.locator('#copy').click();
  const text = await page.evaluate(() => navigator.clipboard.readText());
  const url = new URL(text);
  expect(url.searchParams.get('title')).toBe(`WhatsApp ${saved.recipient}`);
  expect(url.searchParams.get('when')).toBe(`${saved.date}@${saved.time}`);
  expect(new URL(url.searchParams.get('notes')).searchParams.get('text')).toBe(saved.message);
  await expect(page.locator('#status')).not.toContainText('created');
});

test('WhatsApp expired drafts remain visible and clipboard denial exposes a selectable manual link', async ({ page }) => {
  await page.addInitScript(() => { Object.defineProperty(navigator, 'clipboard', { value: { writeText: async () => { throw new Error('Denied'); } } }); });
  await open(page);
  await compose(page);
  await page.locator('#date').fill('2020-01-01');
  await page.reload();
  await expect(page.locator('#date')).toHaveValue('2020-01-01');
  await expect(page.locator('#create')).toBeDisabled();
  await expect(page.locator('#validation')).toContainText('future');
  await page.locator('#date').fill('2090-01-01');
  await page.locator('#copy').click();
  await expect(page.locator('#manual-copy')).toBeVisible();
  await expect(page.locator('#link')).toBeFocused();
  await expect(page.locator('#link')).toHaveValue(/^things:\/\/\/add/);
});

test('WhatsApp stale edits and storage failures retain the visible draft and prevent a destructive handoff', async ({ page, context }) => {
  await page.addInitScript(() => window.addEventListener('storage', event => event.stopImmediatePropagation()));
  await open(page);
  await compose(page);
  const second = await context.newPage();
  await open(second);
  await second.locator('#message').fill('Newer message');
  await page.locator('#message').fill('Stale local draft');
  await expect(page.locator('#status')).toContainText(/changed|conflict/i);
  await expect(page.locator('#message')).toHaveValue('Stale local draft');
  expect((await root(page)).modules.whatsapp.data.draft.message).toBe('Newer message');
  await page.reload();
  await page.evaluate(() => { Storage.prototype.setItem = () => { throw new DOMException('Full', 'QuotaExceededError'); }; });
  await page.locator('#create').click();
  await expect(page.locator('#status')).toContainText(/sav|quota|storage/i);
  await expect(page.locator('#message')).toHaveValue('Newer message');
  expect((await root(page)).modules.whatsapp.data.draft.message).toBe('Newer message');
});

test('WhatsApp import is read-only until recovery confirmation and cancel keeps current records', async ({ page }) => {
  await open(page);
  await compose(page);
  const before = await root(page);
  const input = { app: 'whatsapp-later', schemaVersion: 1, draft: { ...before.modules.whatsapp.data.draft, recipient: 'Imported 👋', date: '2020-01-01' } };
  const file = { name: 'draft.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(input)) };
  await page.locator('#whatsapp-import-file').setInputFiles(file);
  await expect(page.locator('#whatsapp-import-preview')).toBeVisible();
  expect(await root(page)).toEqual(before);
  await expect(page.locator('#whatsapp-import-confirm')).toBeDisabled();
  await page.locator('#whatsapp-import-cancel').click();
  expect(await root(page)).toEqual(before);
  await page.locator('#whatsapp-import-file').setInputFiles(file);
  const pending = page.waitForEvent('download');
  await page.locator('#whatsapp-import-recovery').click();
  await pending;
  await page.locator('#whatsapp-import-confirm').click();
  await expect(page.locator('#recipient')).toHaveValue('Imported 👋');
  await expect(page.locator('#date')).toHaveValue('2020-01-01');
  await expect(page.locator('#create')).toBeDisabled();
});

test('WhatsApp composer and saved draft reopen under the shared worker offline at narrow phone widths', async ({ browser }) => {
  const context = await browser.newContext({ serviceWorkers: 'allow', viewport: { width: 320, height: 740 } });
  const page = await context.newPage();
  await open(page);
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) await new Promise(resolve => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true }));
  });
  await compose(page);
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('#message')).toHaveValue('Café 👋\nA&B + 100% #yes');
  await page.getByRole('button', { name: 'Español', exact: true }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator('[data-module="whatsapp"]').screenshot({ path: 'reports/whatsapp-offline-phone.png' });
  await context.close();
});
