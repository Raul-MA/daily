import { test, expect } from '@playwright/test';
import { prepare } from './fixtures.js';

test.use({ serviceWorkers: 'allow' });
async function controlled(page) {
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) await new Promise(resolve => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true }));
  });
}

test('Reader saved picks reopen offline and failed refresh retains the previous selection', async ({ page, context }) => {
  await prepare(page);
  await controlled(page);
  await page.locator('#pickButton').click();
  await expect(page.locator('#results .result-card')).toHaveCount(3);
  const before = await page.evaluate(() => localStorage.getItem('daily:v1'));
  await context.setOffline(true);
  await page.route('https://readwise.io/api/**', route => route.abort('internetdisconnected'));
  await page.reload();
  await expect(page.locator('#results .result-card')).toHaveCount(3);
  await page.locator('#refreshButton').click();
  await expect(page.locator('#status')).toContainText(/connect|reach|network|offline/i);
  await expect(page.locator('#results .result-card')).toHaveCount(3);
  expect(await page.evaluate(() => localStorage.getItem('daily:v1'))).toBe(before);
});

test('scheduled review metadata reopens offline with a cached label while API responses stay out of worker caches', async ({ page, context }) => {
  await prepare(page, { handle: async (route, url) => {
    if (!url.pathname.includes('/review/')) return false;
    await route.fulfill({ json: { review_id: 8, review_url: 'https://readwise.io/reviews/8', review_completed: false, highlights: [{ id: 1, text: 'Offline highlight.', title: 'A book' }] } });
    return true;
  } });
  await controlled(page);
  await page.goto('./#/reading/review');
  await expect(page.locator('[data-review-card]')).toContainText('Offline highlight.');
  await context.setOffline(true);
  await page.route('https://readwise.io/api/**', route => route.abort('internetdisconnected'));
  await page.reload();
  await expect(page.locator('[data-review-card]')).toContainText('Offline highlight.');
  await expect(page.locator('[data-review-status]')).toContainText(/cached/i);
  await expect(page.getByRole('button', { name: 'Mark review complete', exact: true })).toBeDisabled();
  const urls = await page.evaluate(async () => {
    const keys = await caches.keys();
    const groups = await Promise.all(keys.map(async key => (await (await caches.open(key)).keys()).map(request => request.url)));
    return groups.flat();
  });
  expect(urls.some(url => url.startsWith('https://readwise.io/api/'))).toBe(false);
});
