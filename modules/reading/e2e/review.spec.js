import { test, expect } from '@playwright/test';
import { prepare } from './fixtures.js';

const review = { review_id: 7, review_url: 'https://readwise.io/reviews/7', review_completed: false, highlights: [{ id: 9, text: 'An ordinary highlight.', title: 'A book', author: 'An author' }] };
async function open(page, options = {}) {
  const calls = await prepare(page, { handle: async (route, url) => {
    if (!url.pathname.includes('/review/')) return false;
    const complete = url.pathname.endsWith('/complete/');
    const status = complete ? options.completeStatus ?? 200 : options.status ?? 200;
    await route.fulfill({ status, json: complete ? { review_id: 7, review_completed: true } : options.review ?? review });
    return true;
  } });
  await page.goto('./#/reading/review');
  return calls;
}

test('review without credentials offers a direct handoff without issuing requests', async ({ page }) => {
  let calls = 0;
  await page.route('https://readwise.io/api/**', route => { calls++; return route.fulfill({ status: 500 }); });
  await page.goto('./#/reading/review');
  await expect(page.locator('[data-review-direct]')).toHaveAttribute('href', 'https://readwise.io/dailyreview');
  await expect(page.locator('[data-review-status]')).toContainText(/token|credentials/i);
  expect(calls).toBe(0);
});

test('latest review shows ordinary highlights and explicit Readwise feedback handoffs without marking completion', async ({ page }) => {
  const calls = await open(page);
  await expect(page.locator('[data-review-card]')).toContainText('An ordinary highlight.');
  await expect(page.locator('[data-review-heading]')).toHaveText('Latest available review');
  await expect(page.getByRole('button', { name: 'Reveal answer', exact: true })).toHaveCount(0);
  await expect(page.locator('[data-review-feedback]')).toHaveCount(4);
  for (const node of await page.locator('[data-review-feedback]').all()) await expect(node).toHaveAttribute('href', review.review_url);
  expect(calls.filter(url => url.pathname.endsWith('/complete/'))).toHaveLength(0);
  await expect(page.locator('[data-review-completed]')).toHaveCount(0);
});

test('explicit review completion waits for server confirmation and then disables repeated completion', async ({ page }) => {
  const calls = await open(page);
  await expect(page.locator('[data-review-card]')).toBeVisible();
  await page.getByRole('button', { name: 'Mark review complete', exact: true }).click();
  await expect(page.locator('[data-review-completed]')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Mark review complete', exact: true })).toBeDisabled();
  expect(calls.filter(url => url.pathname.endsWith('/complete/'))).toHaveLength(1);
});

test('failed completion keeps the review unfinished and reports the server failure', async ({ page }) => {
  await open(page, { completeStatus: 500 });
  await expect(page.locator('[data-review-card]')).toBeVisible();
  await page.getByRole('button', { name: 'Mark review complete', exact: true }).click();
  await expect(page.locator('[data-review-status]')).toContainText('500');
  await expect(page.locator('[data-review-completed]')).toHaveCount(0);
});

test('missing review and API failure retain the direct fallback and leave local apps usable', async ({ page }) => {
  await open(page, { status: 404 });
  await expect(page.locator('[data-review-status]')).toContainText(/no.*review|not.*available/i);
  await expect(page.locator('[data-review-direct]')).toHaveAttribute('href', 'https://readwise.io/dailyreview');
  await page.getByRole('link', { name: 'Home', exact: true }).click();
  await page.locator('[data-widget="quick"] a[href$="/coffee/new"]').click();
  await expect(page.locator('[data-module="coffee"]')).toBeVisible();
});

test('capability-gated Q&A component reveals answers accessibly and resets on the next card', async ({ page }) => {
  await open(page, { status: 404 });
  await page.evaluate(async () => {
    const { mountReviewCards } = await import('./modules/reading/src/review/cards.js');
    const host = document.createElement('section');
    host.id = 'qa-fixture';
    document.querySelector('#content').append(host);
    mountReviewCards(host, [{ kind: 'qa', question: 'Which note?', answer: 'C' }, { kind: 'qa', question: 'Which chord?', answer: 'C major' }], { qa: true, language: 'en' });
  });
  const host = page.locator('#qa-fixture');
  await expect(host).toContainText('Which note?');
  await expect(host.locator('[data-review-answer]')).toHaveCount(0);
  await host.getByRole('button', { name: 'Reveal answer', exact: true }).click();
  await expect(host.locator('[data-review-answer]')).toHaveText('C');
  await expect(host.locator('[data-review-answer]')).toBeFocused();
  await host.getByRole('button', { name: 'Next card', exact: true }).click();
  await expect(host).toContainText('Which chord?');
  await expect(host.locator('[data-review-answer]')).toHaveCount(0);
});

test('review action bar advances locally and completes only on the final Done', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const highlights = [review.highlights[0], { id: 10, text: 'Second highlight. '.repeat(180), title: 'Second book', author: 'Second author' }];
  const calls = await open(page, { review: { ...review, highlights } });
  const bar = page.locator('.review-actions');
  await expect(page.locator('[data-review-progress]')).toContainText('1 of 2');
  for (const name of ['Discard', 'Master', 'Frequency']) {
    await expect(bar.getByRole('link', { name: `${name} — open in Readwise`, exact: true })).toHaveAttribute('href', review.review_url);
  }
  for (const width of [320, 390, 1280]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    const positions = await bar.locator(':scope > *').evaluateAll(nodes => nodes.map(node => node.getBoundingClientRect().x));
    expect(positions).toEqual([...positions].sort((first, second) => first - second));
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'reports/reading-review-layout-phone.png' });
  await bar.getByRole('button', { name: 'Done', exact: true }).click();
  await expect(page.locator('[data-review-progress]')).toBeFocused();
  await expect(page.locator('[data-review-card]')).toContainText('Second highlight.');
  await expect(page.locator('[data-review-progress]')).toContainText('2 of 2');
  expect(calls.filter(url => url.pathname.endsWith('/complete/'))).toHaveLength(0);
  await page.getByRole('button', { name: 'Previous card', exact: true }).click();
  await expect(page.locator('[data-review-progress]')).toContainText('1 of 2');
  await bar.getByRole('button', { name: 'Done', exact: true }).click();
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  const bounds = await bar.boundingBox();
  expect(bounds.y + bounds.height).toBeLessThanOrEqual(844);
  expect(bounds.y).toBeGreaterThan(0);
  const footer = await page.locator('.shell-footer').boundingBox();
  expect(footer.y + footer.height).toBeLessThanOrEqual(bounds.y);
  await bar.getByRole('button', { name: 'Mark review complete', exact: true }).click();
  await expect(page.locator('[data-review-completed]')).toBeVisible();
  expect(calls.filter(url => url.pathname.endsWith('/complete/'))).toHaveLength(1);
});
