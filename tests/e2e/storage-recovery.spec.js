import { test, expect } from '@playwright/test';
import { initialDailyDocument } from '../../packages/data/src/daily-document.js';

function incoming() {
  const root = initialDailyDocument('en');
  root.modules.whatsapp = { version: 1, data: { draft: { recipient: 'Someone 🌱', message: 'Saved message ☕', date: '2020-01-01', time: '09:00' } } };
  return root;
}
async function open(page, primary = '{broken') {
  await page.addInitScript(value => {
    localStorage.setItem('daily:v1', value);
    localStorage.setItem('daily:v1:recovery', '{bad recovery');
    localStorage.setItem('other-app', 'keep');
    localStorage.setItem('daily:readwise:token:v1', JSON.stringify({ token: 'fixture-private-token', accountId: 'fixture-account' }));
  }, primary);
  await page.route('https://readwise.io/api/**', route => route.abort());
  await page.goto('./#/');
  await expect(page.getByRole('heading', { name: 'Local data needs attention', exact: true })).toBeVisible();
}
async function select(page) {
  await page.locator('#daily-backup-file').setInputFiles({ name: 'daily.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ app: 'daily-pwa', schemaVersion: 1, data: incoming() })) });
}
async function recovery(page) {
  const downloading = page.waitForEvent('download');
  await page.locator('#daily-backup-recovery').click();
  let text = '';
  for await (const chunk of await (await downloading).createReadStream()) text += chunk.toString();
  return JSON.parse(text);
}

test('unreadable storage can be preserved and restored through a validated recovery-first preview at 320px', async ({ page }) => {
  await open(page);
  await page.setViewportSize({ width: 320, height: 740 });
  await expect(page.locator('#dashboard')).toHaveCount(0);
  await select(page);
  await expect(page.locator('#daily-backup-preview')).toBeVisible();
  await expect(page.locator('#daily-backup-confirm')).toBeDisabled();
  const copy = await recovery(page);
  expect(copy.app).toBe('daily-storage-recovery');
  expect(copy.entries['daily:v1']).toBe('{broken');
  expect(JSON.stringify(copy)).not.toContain('fixture-private-token');
  expect(Object.keys(copy.entries)).toEqual(['daily:v1', 'daily:v1:recovery', 'daily:v1:corrupt']);
  await expect(page.locator('#daily-backup-confirm')).toBeEnabled();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator('#daily-backup-confirm').click();
  await expect(page.getByRole('heading', { name: 'Settings', exact: true })).toBeVisible();
  await expect(page.locator('#daily-backup-status')).toContainText('restored');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('daily:v1')))).toEqual(incoming());
  expect(await page.evaluate(() => localStorage.getItem('other-app'))).toBe('keep');
  expect(await page.evaluate(() => localStorage.getItem('daily:v1:corrupt'))).toBe('{broken');
  expect(await page.evaluate(() => localStorage.getItem('daily:readwise:token:v1'))).toBeNull();
});

test('future stored root versions remain exportable and are never downgraded by the recovery screen', async ({ page }) => {
  const primary = JSON.stringify({ version: 99 });
  await open(page, primary);
  const copy = await recovery(page);
  expect(copy.entries['daily:v1']).toBe(primary);
  await select(page);
  await expect(page.locator('#daily-backup-status')).toContainText(/version|format|supported/i);
  await expect(page.locator('#daily-backup-confirm')).toBeDisabled();
  await page.locator('#daily-backup-cancel').click();
  await expect(page.locator('#daily-backup-file')).toHaveValue('');
  expect(await page.evaluate(() => localStorage.getItem('daily:v1'))).toBe(primary);
});

test('recovery quota and stale-preview failures preserve unreadable records and allow cancellation', async ({ page }) => {
  await open(page);
  await select(page);
  await expect(page.locator('#daily-backup-preview')).toBeVisible();
  await recovery(page);
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    window.restoreRootWrites = () => { Storage.prototype.setItem = original; };
    Storage.prototype.setItem = function (key, value) {
      if (key === 'daily:v1') throw new Error('QuotaExceededError');
      return original.call(this, key, value);
    };
  });
  await page.locator('#daily-backup-confirm').click();
  await expect(page.locator('#daily-backup-status')).toContainText(/save|quota|storage/i);
  expect(await page.evaluate(() => localStorage.getItem('daily:v1'))).toBe('{broken');
  await page.evaluate(() => { window.restoreRootWrites(); localStorage.setItem('daily:v1:recovery', 'newer recovery'); });
  await page.locator('#daily-backup-confirm').click();
  await expect(page.locator('#daily-backup-status')).toContainText(/changed|stale/i);
  await page.locator('#daily-backup-cancel').click();
  await expect(page.locator('#daily-backup-file')).toHaveValue('');
  expect(await page.evaluate(() => localStorage.getItem('daily:v1'))).toBe('{broken');
  expect(await page.evaluate(() => localStorage.getItem('other-app'))).toBe('keep');
});
