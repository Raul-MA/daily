import { test, expect } from '@playwright/test';
import { prepare } from './fixtures.js';

const latest = { review_id: 42, review_url: 'https://readwise.io/reviews/42', review_completed: false, highlights: [
  { id: 1, text: 'The first passage to remember.', title: 'A useful book', author: 'An author' },
  { id: 2, text: 'The second passage to consider.', title: 'Another book', author: 'Another author' },
] };

async function reviewFixture(page, options = {}) {
  let posts = 0;
  let reads = 0;
  let completed = false;
  let status = 200;
  let completeStatus = options.completeStatus ?? 200;
  await prepare(page, { handle: async (route, url) => {
    if (!url.pathname.includes('/review/')) return false;
    if (url.pathname.endsWith('/complete/')) {
      posts++;
      if (completeStatus === 200) completed = true;
      await route.fulfill({ status: completeStatus, json: { review_id: 42, review_completed: completed } });
    } else { reads++; await route.fulfill({ status, json: { ...latest, review_completed: completed } }); }
    return true;
  } });
  return { posts: () => posts, reads: () => reads, status: value => { status = value; }, recoverCompletion: () => { completeStatus = 200; } };
}

test('dashboard displays the undated latest review with honest labeling and Refresh without completing it', async ({ page }) => {
  const calls = await reviewFixture(page);
  await page.getByRole('link', { name: 'Home', exact: true }).click();
  const review = page.locator('[data-reading-review]');
  await expect(review).toContainText('Latest available review');
  await expect(review).toContainText('Date unverified');
  await expect(review).toContainText('Readwise does not provide this review’s date.');
  await expect(review.locator('[data-review-card]')).toContainText(latest.highlights[0].text);
  const before = calls.reads();
  await review.getByRole('button', { name: 'Refresh', exact: true }).click();
  await expect.poll(calls.reads).toBeGreaterThan(before);
  expect(calls.posts()).toBe(0);
  await page.getByRole('button', { name: 'Español', exact: true }).click();
  await expect(review).toContainText('Último repaso disponible');
  await expect(review).toContainText('Fecha sin verificar');
  await expect(review.locator('[data-review-card]')).toContainText(latest.highlights[0].text);
});

test('dashboard review persists Previous and Next and completes explicitly with a server-confirmed summary and revisit', async ({ page }, testInfo) => {
  const calls = await reviewFixture(page);
  await page.getByRole('link', { name: 'Home', exact: true }).click();
  await expect(page.locator('.daily-read')).toHaveCount(3);
  const host = page.locator('[data-reading-review]');
  await expect(host.locator('[data-review-card]')).toContainText(latest.highlights[0].text);
  for (const width of [320, 390, 1280]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    await page.screenshot({ path: testInfo.outputPath(`review-dashboard-${width}.png`), fullPage: true });
  }
  await expect(host.getByRole('button', { name: 'Previous', exact: true })).toBeDisabled();
  await host.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(host.locator('[data-review-progress]')).toBeFocused();
  await expect(host).toContainText('2 of 2');
  expect(calls.posts()).toBe(0);
  await page.reload();
  await expect(host.locator('[data-review-card]')).toContainText(latest.highlights[1].text);
  await host.getByRole('button', { name: 'Previous', exact: true }).click();
  await expect(host).toContainText('1 of 2');
  await host.getByRole('button', { name: 'Next', exact: true }).click();
  await host.getByRole('button', { name: 'Complete review', exact: true }).click();
  await expect(host.locator('.reading-complete')).toHaveText('Review complete');
  expect(calls.posts()).toBe(1);
  await page.reload();
  await expect(host.locator('.reading-complete')).toHaveText('Review complete');
  await expect(host.locator('[data-review-card]')).toHaveCount(0);
  await host.getByRole('button', { name: 'Revisit highlights', exact: true }).click();
  await expect(host.locator('[data-review-card]')).toContainText(latest.highlights[0].text);
  expect(calls.posts()).toBe(1);
});

test('dashboard review refresh failures retain readable highlights and explicit retry recovers or shows an empty review', async ({ page }) => {
  const calls = await reviewFixture(page);
  await page.getByRole('link', { name: 'Home', exact: true }).click();
  const host = page.locator('[data-reading-review]');
  await expect(host.locator('[data-review-card]')).toBeVisible();
  calls.status(500);
  await host.getByRole('button', { name: 'Refresh', exact: true }).click();
  await expect(host.getByRole('alert')).toContainText('500');
  await expect(host.locator('[data-review-card]')).toContainText(latest.highlights[0].text);
  calls.status(200);
  await host.getByRole('button', { name: 'Refresh', exact: true }).click();
  await expect(host.getByRole('alert')).toHaveCount(0);
  calls.status(404);
  await host.getByRole('button', { name: 'Refresh', exact: true }).click();
  await expect(host).toContainText('No scheduled review is available.');
  await expect(host.locator('[data-review-card]')).toHaveCount(0);
  await expect(page.locator('.daily-read')).toHaveCount(3);
  expect(calls.posts()).toBe(0);
});

test('dashboard failed completion stays on the final highlight and retries without reporting false success', async ({ page }) => {
  const calls = await reviewFixture(page, { completeStatus: 500 });
  await page.getByRole('link', { name: 'Home', exact: true }).click();
  const host = page.locator('[data-reading-review]');
  await host.getByRole('button', { name: 'Next', exact: true }).click();
  await host.getByRole('button', { name: 'Complete review', exact: true }).click();
  await expect(host.getByRole('alert')).toContainText('500');
  await expect(host.locator('.reading-complete')).toHaveCount(0);
  await expect(host.locator('[data-review-card]')).toContainText(latest.highlights[1].text);
  calls.recoverCompletion();
  await host.getByRole('button', { name: 'Complete review', exact: true }).click();
  await expect(host.locator('.reading-complete')).toHaveText('Review complete');
  expect(calls.posts()).toBe(2);
});
