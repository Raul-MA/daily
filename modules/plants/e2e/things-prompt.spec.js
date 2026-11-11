import { test, expect } from '@playwright/test';

async function openPlant(page, options = {}) {
  await page.clock.install({ time: new Date('2026-11-11T12:00:00Z') });
  await page.addInitScript(options => {
    window.plantThingsURLs = [];
    window.navigation.addEventListener('navigate', event => {
      if (!event.destination.url.startsWith('things:')) return;
      event.preventDefault();
      window.plantThingsURLs.push(event.destination.url);
    });
    if (localStorage.getItem('daily:v1')) return;
    const plant = { id: 'prompt-fern', name: 'Helecho 🌱', species: 'Test fern', notes: 'Check soil + roots', dateAdded: '2026-01-01', schedule: { wateringIntervalDays: 7, soilIntervalMonths: 12, fertilizerIntervalWeeks: 4, fertilizerSeasons: options.paused ? [{ startMonth: 1, endMonth: 12, intervalWeeks: null }] : [], nextDueOverrides: { watering: '2099-01-01' } }, careLog: [] };
    const data = { plants: [plant], things: { enabled: options.enabled ?? true, project: options.project ?? 'Casa 🏡' }, backup: { lastExportAt: null, changesSinceExport: 0, lastReminderAt: null }, storage: { persistenceRequested: false, persistent: false, checkedAt: null } };
    localStorage.setItem('daily:v1', JSON.stringify({ version: 1, preferences: { language: options.language ?? 'en', widgets: ['plants'], quickActions: [] }, modules: { plants: { version: 1, data } } }));
  }, options);
  await page.goto('/daily/#/plants/prompt-fern');
}

async function savedPlant(page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem('daily:v1')).modules.plants.data.plants[0]);
}

async function record(page, name, save = 'Save care') {
  await page.getByRole('button', { name, exact: true }).click();
  await page.getByRole('button', { name: save, exact: true }).click();
}

test('successful care prompts for the recalculated reminder and opens Things only on explicit confirmation', async ({ page }) => {
  await openPlant(page);
  for (const [type, name, date] of [['watering', 'Watering', '2026-11-18'], ['soil', 'Soil change', '2027-11-11'], ['fertilizer', 'Fertilizer', '2026-12-09']]) {
    const launches = await page.evaluate(() => window.plantThingsURLs.length);
    await record(page, `Record ${name.toLowerCase()}`);
    const dialog = page.getByRole('dialog', { name: 'Add next reminder to Things 3?', exact: true });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText(`Helecho 🌱`);
    await expect(dialog).toContainText(name);
    await expect(dialog).toContainText(date);
    expect(await page.evaluate(() => window.plantThingsURLs.length)).toBe(launches);
    const saved = await savedPlant(page);
    expect(saved.careLog.at(-1).type).toBe(type);
    const before = await page.evaluate(() => localStorage.getItem('daily:v1'));
    await dialog.getByRole('button', { name: 'Add to Things 3', exact: true }).click();
    await expect(dialog).toHaveCount(0);
    const urls = await page.evaluate(() => window.plantThingsURLs);
    expect(urls).toHaveLength(launches + 1);
    const url = new URL(urls.at(-1));
    expect(url.searchParams.get('title')).toBe(`${name} — Helecho 🌱`);
    expect(url.searchParams.get('when')).toBe(date);
    expect(url.searchParams.get('list')).toBe('Casa 🏡');
    expect(url.searchParams.get('notes')).toContain('Check soil + roots');
    expect(await page.evaluate(() => localStorage.getItem('daily:v1'))).toBe(before);
  }
  await page.reload();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect((await savedPlant(page)).careLog).toHaveLength(3);
});

test('Spanish prompts follow skipped and manually rescheduled care and dismiss without undoing saved care', async ({ page }) => {
  await openPlant(page, { language: 'es', project: 'Plantas' });
  await page.setViewportSize({ width: 320, height: 844 });
  await record(page, 'Omitir riego', 'Guardar cuidado');
  const dialog = page.getByRole('dialog', { name: '¿Añadir el próximo recordatorio a Things 3?', exact: true });
  await expect(dialog).toContainText('2026-11-14');
  const before = await savedPlant(page);
  await dialog.getByRole('button', { name: 'Ahora no', exact: true }).click();
  await expect(dialog).toHaveCount(0);
  expect(await savedPlant(page)).toEqual(before);
  expect(await page.evaluate(() => window.plantThingsURLs)).toEqual([]);
  await page.getByRole('button', { name: 'Ajustar próximo riego', exact: true }).click();
  await page.getByLabel('Próxima fecha de cuidado', { exact: true }).fill('2027-02-03');
  await page.getByRole('button', { name: 'Guardar cuidado', exact: true }).click();
  await expect(dialog).toContainText('2027-02-03');
  expect(await dialog.evaluate(node => node.scrollWidth <= node.clientWidth)).toBe(true);
  await dialog.getByRole('button', { name: 'Añadir a Things 3', exact: true }).click();
  const urls = await page.evaluate(() => window.plantThingsURLs);
  const url = new URL(urls[0]);
  expect(url.searchParams.get('title')).toBe('Riego — Helecho 🌱');
  expect(url.searchParams.get('when')).toBe('2027-02-03');
  expect(url.searchParams.get('list')).toBe('Plantas');
  await record(page, 'Registrar riego', 'Guardar cuidado');
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  expect((await savedPlant(page)).careLog).toHaveLength(3);
  expect(await page.evaluate(() => window.plantThingsURLs.length)).toBe(1);
});

test('disabled Things integration saves care without prompting or launching Things', async ({ page }) => {
  await openPlant(page, { enabled: false });
  await record(page, 'Record watering');
  expect((await savedPlant(page)).careLog).toHaveLength(1);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(await page.evaluate(() => window.plantThingsURLs)).toEqual([]);
});

test('observations paused fertilizer and failed saves do not offer a Things reminder', async ({ page }) => {
  await openPlant(page, { paused: true });
  await page.getByLabel('Observation note', { exact: true }).fill('New leaf 🌱');
  await page.getByRole('button', { name: 'Add observation', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await record(page, 'Record fertilizer');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  const before = await savedPlant(page);
  await page.getByRole('button', { name: 'Record watering', exact: true }).click();
  await page.getByLabel('Care note', { exact: true }).fill('Keep this draft');
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === 'daily:v1') throw new DOMException('Quota exceeded', 'QuotaExceededError');
      return original.call(this, key, value);
    };
  });
  await page.getByRole('button', { name: 'Save care', exact: true }).click();
  await expect(page.locator('[data-module="plants"]').getByRole('alert')).toContainText('Could not save');
  await expect(page.getByLabel('Care note', { exact: true })).toHaveValue('Keep this draft');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(await savedPlant(page)).toEqual(before);
  expect(await page.evaluate(() => window.plantThingsURLs)).toEqual([]);
});
