import { test, expect } from '@playwright/test';
import { buildThingsShortcutURL } from '../src/integrations/things.js';

test.use({ serviceWorkers: 'allow' });

const plant = { id: 'fern-1', name: 'Helecho 🌱', dateAdded: '2026-01-01T12:00:00Z', schedule: { wateringIntervalDays: 7, soilIntervalMonths: 12, fertilizerIntervalWeeks: 4, nextDueOverrides: { watering: '2026-01-08' } }, careLog: [] };

async function seed(page, items = [plant]) {
  await page.addInitScript(items => {
    if (localStorage.getItem('daily:v1') !== null) return;
    localStorage.setItem('daily:v1', JSON.stringify({ version: 1, preferences: { language: 'en', widgets: ['plants', 'quick'], quickActions: ['coffee'] }, modules: { plants: { version: 1, data: { plants: items, things: { enabled: false, project: '' }, backup: { lastExportAt: null, lastReminderAt: null, changesSinceExport: 0 }, storage: { persistenceRequested: false, persistent: false, checkedAt: null } } } } }));
    localStorage.setItem('plantTracker_plants', 'legacy storage must stay untouched');
  }, items);
}

async function detail(page) {
  await page.goto('/daily/#/plants/fern-1');
  await expect(page.getByRole('heading', { name: 'Helecho 🌱', exact: true })).toBeVisible();
}

async function settings(page) { await page.goto('/daily/#/plants/settings'); }
const saved = page => page.evaluate(() => JSON.parse(localStorage.getItem('daily:v1')).modules.plants.data);

async function singleColumn(page, testInfo) {
  await page.goto('/daily/#/plants');
  for (const width of [1280, 900, 320]) {
    await page.setViewportSize({ width, height: 900 });
    const title = await page.locator('.plant-page-title').boundingBox();
    const cards = page.locator('.plant-cards-grid > .plant-card');
    await expect(cards).toHaveCount(2);
    const first = await cards.nth(0).boundingBox();
    const second = await cards.nth(1).boundingBox();
    expect(first.y).toBeGreaterThan(title.y + title.height);
    expect(second.y).toBeGreaterThanOrEqual(first.y + first.height);
    expect(second.x).toBe(first.x);
    expect(second.width).toBe(first.width);
    const container = await page.locator('[data-module="plants"]').evaluate(node => {
      const style = getComputedStyle(node);
      return node.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    });
    expect(first.width).toBeCloseTo(container, 0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`plants-list-${width}.png`), fullPage: true });
  }
}

test('plant creation edit and deletion use canonical routes and retain other storage', async ({ page }) => {
  await page.goto('/daily/#/plants/new');
  await page.getByLabel('Plant name', { exact: true }).fill('My fern 🌱');
  await page.getByLabel('Location', { exact: true }).fill('Window');
  await page.getByRole('button', { name: 'Add plant', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'My fern 🌱', exact: true })).toBeVisible();
  const first = (await saved(page)).plants[0];
  await expect(page).toHaveURL(new RegExp(`#/plants/${first.id}$`));
  await page.getByRole('link', { name: 'Edit plant', exact: true }).click();
  await page.getByLabel('Plant name', { exact: true }).fill('Edited fern');
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  expect((await saved(page)).plants[0].id).toBe(first.id);
  await page.getByRole('button', { name: 'Delete plant', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Confirm delete', exact: true }).click();
  expect((await saved(page)).plants).toEqual([]);
  await expect(page).toHaveURL(/#\/plants$/);
});

test('care logging skip and manual dates keep one history and support editing and deleting entries', async ({ page }) => {
  await seed(page);
  await detail(page);
  await page.getByRole('button', { name: 'Record watering', exact: true }).click();
  await page.getByLabel('Care note', { exact: true }).fill('Regada 💧');
  await page.getByRole('button', { name: 'Save care', exact: true }).click();
  expect((await saved(page)).plants[0].careLog[0].type).toBe('watering');
  expect((await saved(page)).plants[0].schedule.nextDueOverrides?.watering).toBeUndefined();
  await page.getByRole('button', { name: 'Skip watering', exact: true }).click();
  await page.getByLabel('Days until next check', { exact: true }).fill('3');
  await page.getByLabel('Care note', { exact: true }).fill('Still damp');
  await page.getByRole('button', { name: 'Save care', exact: true }).click();
  const item = (await saved(page)).plants[0];
  expect(item.careLog.map(entry => entry.type)).toEqual(['watering', 'skip']);
  expect(item.schedule.nextDueOverrides.watering).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  await page.getByRole('button', { name: 'Set next watering date', exact: true }).click();
  await page.getByLabel('Next care date', { exact: true }).fill('2027-01-10');
  await page.getByRole('button', { name: 'Save care', exact: true }).click();
  expect((await saved(page)).plants[0].schedule.nextDueOverrides.watering).toBe('2027-01-10');
  const entry = page.locator('[data-entry-id]').first();
  await entry.getByRole('button', { name: 'Edit entry', exact: true }).click();
  await entry.getByLabel('Entry note', { exact: true }).fill('Updated note');
  await entry.getByRole('button', { name: 'Save entry', exact: true }).click();
  await expect(entry).toContainText('Updated note');
  await entry.getByRole('button', { name: 'Delete entry', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Confirm delete', exact: true }).click();
  expect((await saved(page)).plants[0].careLog.length).toBe(2);
});

test('dashboard reminders open the stable plant without completing care or changing legacy keys', async ({ page }) => {
  await seed(page);
  await page.goto('/daily/#/');
  const before = await page.evaluate(() => ({ ...localStorage }));
  await page.locator('[data-widget="plants"]').getByRole('link', { name: /Helecho/ }).first().click();
  await expect(page).toHaveURL(/#\/plants\/fern-1$/);
  await expect(page.getByRole('heading', { name: 'Helecho 🌱', exact: true })).toBeVisible();
  expect(await page.evaluate(() => ({ ...localStorage }))).toEqual(before);
  await page.reload();
  expect((await saved(page)).plants[0].careLog).toEqual([]);
});

async function preview(page, value) {
  await page.getByLabel('Plant backup file', { exact: true }).setInputFiles({ name: 'plants.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(value)) });
}

test('plant import previews can be canceled and replacement requires a recovery download', async ({ page }) => {
  await seed(page);
  await settings(page);
  const before = await saved(page);
  await preview(page, [{ ...plant, id: 'new-id', name: 'Imported plant' }]);
  await expect(page.getByRole('dialog')).toContainText('1 plant');
  await page.getByRole('dialog').getByRole('button', { name: 'Cancel', exact: true }).click();
  expect(await saved(page)).toEqual(before);
  await preview(page, [{ ...plant, id: 'new-id', name: 'Imported plant' }]);
  const confirm = page.getByRole('dialog').getByRole('button', { name: 'Replace plants', exact: true });
  await expect(confirm).toBeEnabled();
  const download = page.waitForEvent('download');
  await page.getByRole('dialog').getByRole('link', { name: 'Download recovery copy', exact: true }).click();
  await download;
  await confirm.click();
  expect((await saved(page)).plants[0].id).toBe('new-id');
  expect(await page.evaluate(() => localStorage.getItem('plantTracker_plants'))).toBe('legacy storage must stay untouched');
});

test('Plants remove Things controls and handoffs while preserving legacy settings and export compatibility', async ({ page }) => {
  await seed(page);
  await settings(page);
  await page.evaluate(() => {
    const root = JSON.parse(localStorage.getItem('daily:v1'));
    root.modules.plants.data.things = { enabled: true, project: 'Casa 🏡' };
    localStorage.setItem('daily:v1', JSON.stringify(root));
  });
  await page.reload();
  await expect(page.getByText('Stillgreen to Things', { exact: true })).toHaveCount(0);
  await expect(page.getByLabel('Create reminders after watering', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Save Things settings', exact: true })).toHaveCount(0);
  await detail(page);
  await expect(page.getByRole('link', { name: 'Add to Things 3', exact: true })).toHaveCount(0);
  const navigations = [];
  const session = await page.context().newCDPSession(page);
  await session.send('Page.enable');
  session.on('Page.frameRequestedNavigation', event => navigations.push(event.url));
  await page.getByRole('button', { name: 'Record watering', exact: true }).click();
  await page.getByRole('button', { name: 'Save care', exact: true }).click();
  expect((await saved(page)).plants[0].careLog[0].type).toBe('watering');
  expect(navigations.filter(url => url.startsWith('shortcuts:'))).toEqual([]);
  const shortcut = buildThingsShortcutURL({ title: 'Legacy reminder', date: '2026-10-20', project: 'Casa 🏡' });
  const url = new URL(shortcut);
  expect(url.protocol).toBe('shortcuts:');
  expect(JSON.parse(url.searchParams.get('text')).project).toBe('Casa 🏡');
  await settings(page);
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export plants and settings', exact: true }).click();
  expect((await download).suggestedFilename()).toBe('stillgreen-migration.json');
  expect((await saved(page)).things).toEqual({ enabled: true, project: 'Casa 🏡' });
});

test('failed care saves retain the visible form and previous stored history', async ({ page }) => {
  await seed(page);
  await detail(page);
  await page.getByRole('button', { name: 'Record watering', exact: true }).click();
  await page.getByLabel('Care note', { exact: true }).fill('Keep my note');
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === 'daily:v1') throw new DOMException('Quota exceeded', 'QuotaExceededError');
      return original.call(this, key, value);
    };
  });
  await page.getByRole('button', { name: 'Save care', exact: true }).click();
  await expect(page.locator('[data-module="plants"]').getByRole('alert')).toContainText('Could not save');
  await expect(page.getByLabel('Care note', { exact: true })).toHaveValue('Keep my note');
  expect((await saved(page)).plants[0].careLog).toEqual([]);
});

test('plant interfaces follow shared Spanish without translating saved names and observations', async ({ page }) => {
  await seed(page);
  await detail(page);
  await page.getByRole('button', { name: 'Español', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Registrar riego', exact: true })).toBeVisible();
  await page.getByLabel('Nota de observación', { exact: true }).fill('Mi observación 🌿');
  await page.getByRole('button', { name: 'Añadir observación', exact: true }).click();
  await page.getByRole('button', { name: 'English', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Helecho 🌱', exact: true })).toBeVisible();
  await expect(page.locator('[data-module="plants"]')).toContainText('Mi observación 🌿');
  expect((await saved(page)).plants[0].name).toBe('Helecho 🌱');
});

test('plant styles stay scoped and invalid imports leave the current plants intact', async ({ page }, testInfo) => {
  await seed(page, [plant, { ...plant, id: 'fern-2', name: 'Second fern' }]);
  await settings(page);
  const before = await saved(page);
  await preview(page, [plant, plant]);
  await expect(page.locator('[data-module="plants"]').getByRole('alert')).toBeVisible();
  expect(await saved(page)).toEqual(before);
  await singleColumn(page, testInfo);
  await detail(page);
  expect(await page.locator('[data-module="plants"]').evaluate(node => getComputedStyle(node).backgroundColor)).toBe('rgb(245, 240, 232)');
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--bg'))).toBe('');
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.screenshot({ path: testInfo.outputPath('plants-desktop.png'), fullPage: true });
  await page.setViewportSize({ width: 320, height: 800 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('plants-phone.png'), fullPage: true });
  await page.getByRole('link', { name: 'Home', exact: true }).click();
  await page.setViewportSize({ width: 320, height: 800 });
  await expect(page.getByRole('heading', { name: 'Today', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('a plant changed in another tab keeps the current draft and refuses a stale edit', async ({ page, context }) => {
  await seed(page);
  await page.goto('/daily/#/plants/fern-1/edit');
  await page.getByLabel('Plant name', { exact: true }).fill('My unsaved draft');
  const other = await context.newPage();
  await detail(other);
  await other.getByRole('button', { name: 'Record watering', exact: true }).click();
  await other.getByRole('button', { name: 'Save care', exact: true }).click();
  await expect(page.getByLabel('Plant name', { exact: true })).toHaveValue('My unsaved draft');
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(page.locator('[data-module="plants"]').getByRole('alert')).toContainText('changed in another');
  expect((await saved(page)).plants[0].name).toBe('Helecho 🌱');
  expect((await saved(page)).plants[0].careLog.length).toBe(1);
});

test('switching language preserves draft plant fields and an open care note', async ({ page }) => {
  await seed(page);
  await page.goto('/daily/#/plants/fern-1/edit');
  await page.getByLabel('Plant name', { exact: true }).fill('Draft 🌱');
  await page.getByRole('button', { name: 'Español', exact: true }).click();
  await expect(page.getByLabel('Nombre de la planta', { exact: true })).toHaveValue('Draft 🌱');
  await detail(page);
  await page.getByRole('button', { name: 'Registrar riego', exact: true }).click();
  await page.getByLabel('Nota de cuidado', { exact: true }).fill('Mi borrador');
  await page.getByRole('button', { name: 'English', exact: true }).click();
  await expect(page.getByLabel('Care note', { exact: true })).toHaveValue('Mi borrador');
  expect((await saved(page)).plants[0].careLog).toEqual([]);
});

test('plant details care logging and settings work after an offline reload', async ({ page, context }) => {
  await seed(page);
  await detail(page);
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller)), { timeout: 10000 }).toBe(true);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Helecho 🌱', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Record watering', exact: true }).click();
  await page.getByLabel('Care note', { exact: true }).fill('Saved offline');
  await page.getByRole('button', { name: 'Save care', exact: true }).click();
  expect((await saved(page)).plants[0].careLog[0].note).toBe('Saved offline');
  await page.getByRole('link', { name: 'Plant settings', exact: true }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Export plants and settings', exact: true })).toBeVisible();
});
