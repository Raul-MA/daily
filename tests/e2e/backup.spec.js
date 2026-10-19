import { test, expect } from '@playwright/test';
import { filledState } from '../fixtures/backup-data.mjs';

async function readDownload(download) {
  let value = '';
  for await (const chunk of await download.createReadStream()) value += chunk.toString();
  return value;
}
async function stored(page) { return page.evaluate(() => JSON.parse(localStorage.getItem('daily:v1'))); }
async function open(page, data) {
  await page.addInitScript(root => {
    if (root && !localStorage.getItem('daily:v1')) localStorage.setItem('daily:v1', JSON.stringify(root));
    if (!sessionStorage.getItem('fixture-credentials-seeded')) {
      sessionStorage.setItem('daily:readwise:session:v1', JSON.stringify({ token: 'fixture-session-secret', accountId: 'fixture-account' }));
      sessionStorage.setItem('fixture-credentials-seeded', 'true');
    }
  }, data ?? null);
  await page.route('https://readwise.io/api/**', route => route.abort());
  await page.goto('./#/settings');
  await expect(page.locator('#daily-backup-export')).toBeVisible();
}
async function select(page, data) {
  await page.locator('#daily-backup-file').setInputFiles({ name: 'daily.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ app: 'daily-pwa', schemaVersion: 1, data })) });
  await expect(page.locator('#daily-backup-preview')).toBeVisible();
}
async function recovery(page) {
  const pending = page.waitForEvent('download');
  await page.locator('#daily-backup-recovery').click();
  return readDownload(await pending);
}

test('full backup downloads all saved modules and layout without credentials or unsaved settings', async ({ page }) => {
  const { root } = await filledState();
  await open(page, root);
  await page.locator('#reader-default-count').fill('19');
  const pending = page.waitForEvent('download');
  await page.locator('#daily-backup-export').click();
  const text = await readDownload(await pending);
  expect(JSON.parse(text).data).toEqual(root);
  expect(text).not.toContain('fixture-session-secret');
  expect(text).not.toContain('fixture-private-token');
  await expect(page.locator('#reader-default-count')).toHaveValue('19');
  expect(await stored(page)).toEqual(root);
});

test('full backup restores every app into a separate browser profile with original overdue clocks and token reentry', async ({ browser }) => {
  const { root } = await filledState();
  const context = await browser.newContext();
  try {
    const page = await context.newPage();
    await open(page);
    await select(page, root);
    await expect(page.locator('#daily-backup-preview')).toContainText(/original|originales/);
    await expect(page.locator('#daily-backup-confirm')).toBeDisabled();
    const previous = JSON.parse(await recovery(page));
    expect(previous.modules).toEqual({});
    await page.locator('#daily-backup-confirm').click();
    await expect(page.locator('#daily-backup-status')).toContainText(/restaurad|restored/i);
    expect(await stored(page)).toEqual(root);
    expect(await page.evaluate(() => sessionStorage.getItem('daily:readwise:session:v1'))).toBeNull();
    await page.reload();
    expect(await stored(page)).toEqual(root);
    await page.getByRole('link', { name: 'Inicio', exact: true }).click();
    await expect(page.locator('.running-indicator')).toContainText('Focus 🌱');
    expect(await stored(page)).toEqual(root);
  } finally { await context.close(); }
});

test('full import invalid cancel stale and quota paths preserve current records and retained credentials', async ({ page }) => {
  const { root } = await filledState();
  await open(page, root);
  await page.locator('#daily-backup-file').setInputFiles({ name: 'invalid.json', mimeType: 'application/json', buffer: Buffer.from('invalid JSON') });
  await expect(page.locator('#daily-backup-status')).toContainText(/JSON/i);
  await page.locator('#daily-backup-cancel').click();
  expect(await stored(page)).toEqual(root);
  const incoming = { ...root, preferences: { ...root.preferences, language: 'en' } };
  await select(page, incoming);
  expect(await stored(page)).toEqual(root);
  expect(JSON.parse(await recovery(page))).toEqual(root);
  await page.evaluate(async () => { const { createDailyState } = await import('./packages/data/src/daily-state.js'); createDailyState(localStorage).updatePreferences({ quickActions: [] }); });
  const newer = await stored(page);
  await page.locator('#daily-backup-confirm').click();
  await expect(page.locator('#daily-backup-status')).toContainText(/cambi|changed|conflict/i);
  expect(await stored(page)).toEqual(newer);
  await page.locator('#daily-backup-cancel').click();
  await select(page, incoming);
  await recovery(page);
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key, value) { if (key === 'daily:v1') throw new DOMException('Full', 'QuotaExceededError'); return original.call(this, key, value); };
  });
  await page.locator('#daily-backup-confirm').click();
  await expect(page.locator('#daily-backup-status')).toContainText(/guard|saving|quota|storage/i);
  expect(await stored(page)).toEqual(newer);
  expect(await page.evaluate(() => sessionStorage.getItem('daily:readwise:session:v1'))).toContain('fixture-session-secret');
  await expect(page.locator('#daily-backup-form')).toHaveAttribute('data-unsaved', 'true');
});

test('full import reports restored records honestly when credential cleanup fails after the root commit', async ({ page }) => {
  const { root } = await filledState();
  await open(page);
  await select(page, root);
  await recovery(page);
  await page.evaluate(() => {
    const original = Storage.prototype.removeItem;
    Storage.prototype.removeItem = function(key) { if (key.startsWith('daily:readwise:')) throw new Error('Credential cleanup failed'); return original.call(this, key); };
  });
  await page.locator('#daily-backup-confirm').click();
  await expect(page.locator('#daily-backup-status')).toContainText(/restaurad.*(token|credencial)|restored.*(token|credential)/i);
  expect(await stored(page)).toEqual(root);
});

test('full restore discards setup drafts retained by another app before importing', async ({ page }) => {
  await open(page);
  const root = await page.evaluate(async () => {
    const { createDailyState } = await import('./packages/data/src/daily-state.js');
    return createDailyState(localStorage).read().value;
  });
  await page.goto('./#/time');
  await page.locator('.task-name-input').first().fill('Old unsaved setup');
  await page.goto('./#/settings');
  await select(page, root);
  await recovery(page);
  await page.locator('#daily-backup-confirm').click();
  await expect(page.locator('#daily-backup-status')).toContainText(/restored/i);
  await page.goto('./#/time');
  await expect(page.locator('.task-name-input').first()).toHaveValue('');
  expect(await stored(page)).toEqual(root);
});
