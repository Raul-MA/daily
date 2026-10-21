import { mockReading } from './browser.mjs';

async function dialog(page) { await page.locator('#settingsButton').click(); await page.locator('#settingsDialog[open]').waitFor(); }
async function ready(page) { await page.locator('[data-review-card]').first().waitFor(); }
async function lower(page) { await page.locator('#reader-import').scrollIntoViewIfNeeded(); }

function reviewResponse(text) {
  return { review_id: 7, review_url: 'https://readwise.io/reviews/7', review_completed: false, highlights: [
    { id: 9, text, title: 'Notes on attention and the shape of an ordinary day', author: 'Synthetic review author' },
    { id: 10, text: 'A second passage gives the review progress room to breathe.', title: 'Reading notes', author: 'Review fixture' },
  ] };
}

function longNetwork(route) {
  const text = 'A thoughtful interface gives each paragraph room to breathe. Pause long enough to notice the small details, then return to the next clear step. ';
  if (new URL(route.request().url()).pathname.includes('/review/')) return route.fulfill({ json: reviewResponse(text.repeat(12)) });
  return mockReading(route);
}

async function emptyNetwork(route) {
  const url = new URL(route.request().url());
  if (url.pathname.includes('/list/')) return route.fulfill({ json: { results: [], nextPageCursor: null } });
  return mockReading(route);
}

function pickerStates(root) {
  const empty = structuredClone(root); empty.modules.reading.data.picks = null; empty.modules.reading.data.lastItem = null;
  return [
    { name: 'saved-picker' },
    { name: 'empty-picker', root: empty, network: emptyNetwork, prepare: async page => {
      await page.locator('#pickButton').click();
      await page.waitForFunction(() => document.querySelector('#status')?.textContent.includes('No matching unfinished'));
    } },
    { name: 'custom-controls', prepare: async page => {
      await page.locator('#minutesInput').selectOption('custom'); await page.locator('#customMinutes').fill('25');
      await page.locator('#countInput').selectOption('custom'); await page.locator('#customCount').fill('7');
    } },
    { name: 'token-dialog', prepare: async page => { await dialog(page); await page.locator('#tokenInput').fill('visual-draft-only'); } },
    { name: 'dialog-preferences', prepare: async page => {
      await dialog(page); await page.locator('#reader-location-order').evaluate(node => node.scrollIntoView({ block: 'start' }));
    } },
    { name: 'dialog-backup', prepare: async page => { await dialog(page); await lower(page); }, sections: { backup: '#reader-import' } },
  ].map(view => ({ url: '/daily/#/reading/picker', root, ...view }));
}

function reviewStates(root) {
  return [
    { name: 'review-ordinary', prepare: ready },
    { name: 'review-progress', prepare: async page => { await ready(page); await page.locator('.review-done').click(); } },
    { name: 'review-long', network: longNetwork, prepare: ready },
    { name: 'review-bottom', network: longNetwork, prepare: ready, scroll: 'bottom', fullPage: false },
    { name: 'review-no-credentials', credentials: false },
    { name: 'review-error', network: route => route.fulfill({ status: 503, body: 'Synthetic unavailable response' }), prepare: async page => {
      await page.waitForFunction(() => /failed|unavailable|error|try|503/i.test(document.querySelector('[data-review-status]')?.textContent ?? ''));
    } },
    { name: 'review-options', scroll: 'bottom', fullPage: false, sections: { feedback: '.review-feedback' }, prepare: async page => { await ready(page); await page.locator('.review-feedback summary').click(); } },
  ].map(view => ({ url: '/daily/#/reading/review', root, ...view }));
}

function backupStates(root) {
  return [
    { name: 'import-preview', prepare: async page => {
      await dialog(page);
      await page.locator('#reader-import-file').setInputFiles({ name: 'visual-reader.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ app: 'daily-reading', schemaVersion: 1, data: root.modules.reading.data })) });
      await page.locator('#reader-import-preview').waitFor(); await lower(page);
    } },
    { name: 'invalid-import', prepare: async page => {
      await dialog(page);
      await page.locator('#reader-import-file').setInputFiles({ name: 'invalid.json', mimeType: 'application/json', buffer: Buffer.from('invalid') });
      await page.waitForFunction(() => document.querySelector('#reader-import-status')?.textContent.length > 0); await lower(page);
    } },
  ].map(view => ({ ...view, url: '/daily/#/reading/picker', root, sections: { backup: '#reader-import' } }));
}

export function readingStates(fixture) {
  const root = fixture.active;
  const spanish = structuredClone(root); spanish.preferences.language = 'es';
  return [
    ...pickerStates(root),
    { name: 'preferences-draft', url: '/daily/#/reading/settings', root, prepare: async page => {
      await page.locator('#reader-default-count').fill('12'); await page.locator('#reader-default-minutes').fill('45');
    } },
    ...reviewStates(root), ...backupStates(root),
    { name: 'spanish-settings', url: '/daily/#/reading/settings', root: spanish },
    { name: 'spanish-review', url: '/daily/#/reading/review', root: spanish, prepare: ready },
  ];
}
