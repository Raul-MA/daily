import { expect } from '@playwright/test';

export const baseline = Boolean(process.env.DAILY_BASELINE_URL);
export const items = [
  { id: 'unread', title: 'Unread five', location: 'new', reading_time: '5 mins', reading_progress: 0 },
  { id: 'started', title: 'Started three', location: 'later', reading_time: '10 mins', reading_progress: 0.75 },
  { id: 'long', title: 'Too long', location: 'new', reading_time: '30 mins', reading_progress: 0 },
  { id: 'short', title: 'Shortlist four', location: 'shortlist', reading_time: '4 mins', reading_progress: 0 },
].map(item => ({ ...item, url: `https://read.readwise.io/read/${item.id}`, category: 'article' }));
export function target(query = '') { return baseline ? `./${query ? `?${query}` : ''}` : `./#/reading/picker${query ? `?${query}` : ''}`; }
export function query(page) {
  const url = new URL(page.url());
  return baseline ? url.searchParams : new URLSearchParams(url.hash.split('?')[1]);
}
export async function prepare(page, options = {}) {
  await page.addInitScript(original => {
    if (original) sessionStorage.setItem('readerPicker.token.v1', 'fixture-only');
    else sessionStorage.setItem('daily:readwise:session:v1', JSON.stringify({ token: 'fixture-only', accountId: 'fixture-account' }));
  }, baseline);
  const calls = [];
  await page.route('https://readwise.io/api/**', async route => {
    const url = new URL(route.request().url());
    calls.push(url);
    if (options.handle && await options.handle(route, url)) return;
    if (url.pathname.endsWith('/auth/')) { await route.fulfill({ status: 204 }); return; }
    const id = url.searchParams.get('id');
    const location = url.searchParams.get('location');
    const results = items.filter(item => id ? item.id === id : item.location === location);
    await route.fulfill({ json: { results, nextPageCursor: null } });
  });
  await page.goto(target(options.query));
  await expect(page.locator('#pickButton')).toBeVisible();
  return calls;
}
export async function settings(page) { await page.locator('#settingsButton').click(); await expect(page.locator('#settingsDialog')).toBeVisible(); }
export async function save(page) { await page.locator('#settingsForm button[type="submit"]').click(); await expect(page.locator('#settingsDialog')).not.toBeVisible(); }
