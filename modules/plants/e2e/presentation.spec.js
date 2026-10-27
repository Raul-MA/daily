import { test, expect } from '@playwright/test';

async function seed(page, overridePlants = null) {
  await page.addInitScript(overridePlants => {
    const plants = ['Later fern', 'Earlier fern'].map((name, index) => ({
      id: `fern-${index}`, name, dateAdded: '2020-01-01',
      schedule: { wateringIntervalDays: 7, soilIntervalMonths: 12, fertilizerIntervalWeeks: 4, nextDueOverrides: { watering: `202${1 - index}-01-01`, soil: `202${1 - index}-01-01`, fertilizer: `202${1 - index}-01-01` } },
      careLog: [{ id: `care-${index}`, type: 'watering', date: '2020-01-01', note: 'Watered carefully 🌱' }],
    }));
    plants.push({ id: 'future-fern', name: 'Future fern', dateAdded: '2099-01-01', schedule: { wateringIntervalDays: 7, soilIntervalMonths: 12, fertilizerIntervalWeeks: 4, nextDueOverrides: { watering: '2099-02-03', soil: '2099-05-06', fertilizer: '2099-03-04' } }, careLog: [] });
    localStorage.setItem('daily:v1', JSON.stringify({ version: 1, preferences: { language: 'en', widgets: ['plants'], quickActions: [] }, modules: { plants: { version: 1, data: { plants: overridePlants ?? plants, things: { enabled: true, project: 'Casa 🏡' }, backup: { lastExportAt: null, changesSinceExport: 0, lastReminderAt: null }, storage: { persistenceRequested: false, persistent: false, checkedAt: null } } } } }));
  }, overridePlants);
}

test('dashboard and Plants group reminders by care type with urgency retained and navigation only', async ({ page }) => {
  await seed(page);
  for (const route of ['/', '/plants']) {
    await page.goto(`/daily/#${route}`);
    const before = await page.evaluate(() => localStorage.getItem('daily:v1'));
    const groups = page.locator('[data-care-group]');
    await expect(groups).toHaveCount(3);
    for (const [index, title] of ['Watering', 'Soil change', 'Fertilizer'].entries()) {
      const group = groups.nth(index);
      await expect(group.getByRole('heading', { name: title, exact: true })).toBeVisible();
      const links = group.getByRole('link');
      await expect(links).toHaveCount(2);
      await expect(links.nth(0)).toContainText('Earlier fern');
      await expect(links.nth(1)).toContainText('Later fern');
      await expect(links.nth(0)).not.toContainText(title);
      await expect(links.nth(0).locator('.pill-overdue')).toContainText('Overdue');
    }
    await groups.first().getByRole('link').first().click();
    await expect(page).toHaveURL(/#\/plants\/fern-1$/);
    expect(await page.evaluate(() => localStorage.getItem('daily:v1'))).toBe(before);
  }
});

test('care history uses a borderless table and retains inline editing on narrow screens', async ({ page }) => {
  await seed(page);
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto('/daily/#/plants/fern-0');
  const table = page.getByRole('table', { name: 'Care history', exact: true });
  await expect(table).toBeVisible();
  await expect(table.getByRole('columnheader')).toHaveCount(4);
  await expect(table).toContainText('Watered carefully 🌱');
  expect(await table.locator('th, td').evaluateAll(cells => cells.every(cell => ['Top', 'Right', 'Bottom', 'Left'].every(side => getComputedStyle(cell)[`border${side}Width`] === '0px')))).toBe(true);
  await table.getByRole('button', { name: 'Edit entry', exact: true }).click();
  await table.getByLabel('Entry note', { exact: true }).fill('Updated table note');
  await table.getByRole('button', { name: 'Save entry', exact: true }).click();
  await expect(table).toContainText('Updated table note');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('plant detail Things buttons send each future planned date and stay enabled after use', async ({ page }) => {
  await seed(page);
  await page.addInitScript(() => {
    window.plantThingsURLs = [];
    window.navigation.addEventListener('navigate', event => {
      if (!/^(things|shortcuts):/.test(event.destination.url)) return;
      event.preventDefault();
      window.plantThingsURLs.push(event.destination.url);
    });
  });
  for (const route of ['/', '/plants']) {
    await page.goto(`/daily/#${route}`);
    await expect(page.getByRole('button', { name: /Things 3/ })).toHaveCount(0);
  }
  await page.goto('/daily/#/plants/future-fern');
  await page.setViewportSize({ width: 320, height: 900 });
  const before = await page.evaluate(() => localStorage.getItem('daily:v1'));
  for (const [type, title, date] of [['watering', 'Watering', '2099-02-03'], ['soil', 'Soil change', '2099-05-06'], ['fertilizer', 'Fertilizer', '2099-03-04']]) {
    const card = page.locator(`.care-action-wrap[data-type="${type}"]`);
    const button = card.getByRole('button', { name: `Add to Things 3: ${title} — Future fern`, exact: true });
    await expect(card).toContainText(date);
    for (let attempt = 0; attempt < 2; attempt += 1) {
      await page.evaluate(() => { window.plantThingsURLs = []; });
      await button.click();
      await expect(button).toBeEnabled();
      const urls = await page.evaluate(() => window.plantThingsURLs);
      expect(urls).toHaveLength(1);
      const url = new URL(urls[0]);
      expect(url.protocol).toBe('things:');
      expect(url.pathname).toBe('/add');
      expect(url.searchParams.get('title')).toBe(`${title} — Future fern`);
      expect(url.searchParams.get('when')).toBe(date);
      expect(url.searchParams.get('list')).toBe('Casa 🏡');
      expect(url.searchParams.get('reveal')).toBe('true');
      expect(url.searchParams.get('notes')).toContain(date);
    }
  }
  expect(await page.evaluate(() => localStorage.getItem('daily:v1'))).toBe(before);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page).toHaveURL(/#\/plants\/future-fern$/);
});

test('today, overdue and paused care have no future Things action on plant details', async ({ page }) => {
  const date = new Date().toLocaleDateString('en-CA');
  await seed(page, [{ id: 'not-future', name: 'Not future fern', dateAdded: '2020-01-01', schedule: { wateringIntervalDays: 7, soilIntervalMonths: 12, fertilizerSeasons: [{ startMonth: 1, endMonth: 12, intervalWeeks: null }], nextDueOverrides: { watering: date } }, careLog: [] }]);
  await page.goto('/daily/#/plants/not-future');
  await expect(page.getByRole('heading', { name: 'Not future fern', exact: true })).toBeVisible();
  await expect(page.locator('[data-type="watering"]')).toContainText('Today');
  await expect(page.locator('[data-type="soil"]')).toContainText('Overdue');
  await expect(page.locator('[data-type="fertilizer"]')).toContainText('Paused');
  await expect(page.getByRole('button', { name: /Things 3/ })).toHaveCount(0);
});
