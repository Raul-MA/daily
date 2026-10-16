import { test, expect } from '@playwright/test';
import { items, prepare, settings } from './fixtures.js';

function deferred() {
  let release;
  const ready = new Promise(resolve => { release = resolve; });
  return { ready, release };
}

test('a shortcut waiting for token entry retains its launch filters without saving them as defaults', async ({ page }) => {
  await page.route('https://readwise.io/api/**', route => {
    const location = new URL(route.request().url()).searchParams.get('location');
    return route.fulfill({ json: { results: items.filter(item => item.location === location), nextPageCursor: null } });
  });
  await page.route('https://read.readwise.io/**', route => route.fulfill({ body: '<p>Reader handoff</p>', contentType: 'text/html' }));
  await page.goto('./#/reading/picker?count=1&minutes=5&run=1&open=auto');
  await expect(page.locator('#settingsDialog')).toBeVisible();
  await page.locator('#tokenInput').fill('fixture-new');
  await page.locator('#settingsForm button[type="submit"]').click();
  await expect(page).toHaveURL(/read\.readwise\.io\/read\//);
  await page.goBack();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('daily:v1')).modules.reading.data);
  expect(saved.settings.count).toBe(3);
  expect(saved.settings.minutes).toBe(10);
  expect(saved.picks.documents).toHaveLength(1);
});

test('an authentication response cannot validate a replacement token draft', async ({ page }) => {
  const gate = deferred();
  const started = deferred();
  await prepare(page, { handle: async (route, url) => {
    if (!url.pathname.endsWith('/auth/')) return false;
    started.release();
    await gate.ready;
    await route.fulfill({ status: 204 });
    return true;
  } });
  await settings(page);
  await page.locator('#tokenInput').fill('fixture-first');
  await page.locator('#testButton').click();
  await started.ready;
  await page.locator('#tokenInput').fill('fixture-second');
  const response = page.waitForResponse('https://readwise.io/api/v2/auth/');
  gate.release();
  await response;
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  await expect(page.locator('#settingsStatus')).not.toContainText('Token works');
  await expect(page.locator('#tokenInput')).toHaveValue('fixture-second');
});

test('changing language during review completion preserves the pending confirmation', async ({ page }) => {
  const gate = deferred();
  const started = deferred();
  const review = { review_id: 91, review_completed: false, highlights: [{ id: 9, text: 'Keep this review.' }] };
  await prepare(page, { handle: async (route, url) => {
    if (!url.pathname.includes('/review/')) return false;
    if (url.pathname.endsWith('/complete/')) {
      started.release();
      await gate.ready;
      await route.fulfill({ json: { review_id: 91, review_completed: true } });
    } else await route.fulfill({ json: review });
    return true;
  } });
  await page.goto('./#/reading/review');
  await expect(page.locator('[data-review-card]')).toBeVisible();
  await page.getByRole('button', { name: 'Mark review complete', exact: true }).click();
  await started.ready;
  await page.getByRole('button', { name: 'Español', exact: true }).click();
  await expect(page.locator('[data-review-status]')).toContainText('Esperando');
  gate.release();
  await expect(page.locator('[data-review-completed]')).toBeVisible();
});

test('a shortcut resumed after token entry does not reshuffle when the language changes', async ({ page }) => {
  await page.route('https://readwise.io/api/**', route => {
    const location = new URL(route.request().url()).searchParams.get('location');
    return route.fulfill({ json: { results: items.filter(item => item.location === location), nextPageCursor: null } });
  });
  await page.goto('./#/reading/picker?count=2&minutes=5&run=1');
  await page.locator('#tokenInput').fill('fixture-new');
  await page.locator('#settingsForm button[type="submit"]').click();
  await expect(page.locator('#results .result-card')).toHaveCount(2);
  const picks = await page.evaluate(() => JSON.stringify(JSON.parse(localStorage.getItem('daily:v1')).modules.reading.data.picks));
  await page.getByRole('button', { name: 'Español', exact: true }).click();
  await expect(page.locator('#pickButton')).toHaveText('Elegir por mí');
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  expect(await page.evaluate(() => JSON.stringify(JSON.parse(localStorage.getItem('daily:v1')).modules.reading.data.picks))).toBe(picks);
});
