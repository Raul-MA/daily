import { test, expect } from '@playwright/test';

test.use({ serviceWorkers: 'allow' });

async function open(page) {
  const time = new Date('2026-10-15T12:00:00Z');
  await page.clock.install({ time });
  await page.clock.pauseAt(time);
  await page.goto('./#/piano/learn?lesson=interval-foundations');
  await expect(page.locator('.practice-setup')).toBeVisible();
}
async function start(page) { await page.locator('.practice-setup button[type="submit"]').click(); await expect(page.locator('[data-clock]')).toBeVisible(); }
async function root(page) { return page.evaluate(() => localStorage.getItem('daily:v1')); }

test('piano sessions continue across Home and reload with stable blocks prompts answers and timestamps', async ({ page }) => {
  await open(page);
  await start(page);
  await page.locator('[data-action="next"]').click();
  await page.locator('[data-action="reveal"]').click();
  const answer = await page.locator('.practice-answer').textContent();
  const before = await root(page);
  await page.getByRole('link', { name: 'Home', exact: true }).click();
  await page.clock.runFor(90000);
  await expect(page.locator('[data-widget="activities"]')).toContainText('Find thirds and fifths');
  await page.goto('./#/piano/learn?lesson=interval-foundations');
  await expect(page.locator('[data-clock]')).toContainText('1:30 elapsed');
  await expect(page.locator('.practice-answer')).toHaveText(answer);
  expect(await root(page)).toBe(before);
  await page.reload();
  await expect(page.locator('[data-clock]')).toContainText('1:30 elapsed');
  await expect(page.locator('.practice-answer')).toHaveText(answer);
});

test('hiding piano never pauses elapsed time while explicit Pause survives background and reload', async ({ page }) => {
  await open(page);
  await start(page);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.clock.runFor(90000);
  await page.evaluate(() => { delete document.hidden; document.dispatchEvent(new Event('visibilitychange')); });
  await expect(page.locator('[data-action="pause"]')).toHaveText('Pause');
  await expect(page.locator('[data-clock]')).toContainText('1:30 elapsed');
  await page.locator('[data-action="pause"]').click();
  const before = await root(page);
  await page.clock.runFor(60000);
  await page.reload();
  await expect(page.locator('[data-action="pause"]')).toHaveText('Resume');
  await expect(page.locator('[data-clock]')).toContainText('1:30 elapsed');
  expect(await root(page)).toBe(before);
});

test('soft practice budgets preserve the active session until explicit finish and save one history record', async ({ page }) => {
  await open(page);
  await start(page);
  await page.clock.runFor(660000);
  await expect(page.locator('[data-total-notice]')).toBeVisible();
  await expect(page.locator('[data-action="pause"]')).toHaveText('Pause');
  const before = JSON.parse(await root(page));
  expect(before.modules.piano.data.history).toHaveLength(0);
  await page.locator('[data-action="finish"]').click();
  const after = JSON.parse(await root(page));
  expect(after.modules.piano.data.practice).toBeNull();
  expect(after.modules.piano.data.history).toHaveLength(1);
  expect(after.modules.piano.data.history[0].elapsedMs).toBe(660000);
  expect(after.modules.activities.data.find(item => item.kind === 'piano').status).toBe('completed');
  await page.reload();
  expect(JSON.parse(await root(page)).modules.piano.data.history).toHaveLength(1);
});

test('opening another lesson offers the persisted practice and never overwrites it', async ({ page }) => {
  await open(page);
  await start(page);
  const before = await root(page);
  await page.goto('./#/piano/learn?lesson=rhythm-and-motif');
  await expect(page.locator('[data-piano-existing]')).toBeVisible();
  expect(await root(page)).toBe(before);
  await page.locator('[data-piano-resume]').click();
  await expect(page.locator('.practice-page h1')).toHaveText('Find thirds and fifths');
  expect(await root(page)).toBe(before);
});

test('random and last exercise links use stable IDs and opening an exercise creates no practice', async ({ page }) => {
  await page.goto('./#/');
  expect(await root(page)).toBeNull();
  await page.locator('[data-widget="piano"] [data-piano-random]').click();
  await expect(page).toHaveURL(/#\/piano\/exercises\/[^/?]+/);
  await expect(page.locator('.exercise-shell')).toBeVisible();
  const saved = JSON.parse(await root(page));
  const id = saved.modules.piano.data.lastExerciseId;
  expect(saved.modules.piano.data.practice).toBeNull();
  await page.getByRole('link', { name: 'Home', exact: true }).click();
  await expect(page.locator('[data-widget="piano"] [data-piano-last]')).toHaveAttribute('href', `/daily/#/piano/exercises/${encodeURIComponent(id)}`);
  await page.locator('[data-widget="piano"] [data-piano-last]').click();
  expect(JSON.parse(await root(page)).modules.piano.data.lastExerciseId).toBe(id);
});

test('piano practice and keyboard answers resume offline under the shared worker', async ({ page, context }) => {
  await open(page);
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) await new Promise(resolve => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true }));
  });
  await start(page);
  await page.locator('[data-action="next"]').click();
  await page.locator('[data-action="reveal"]').click();
  await context.setOffline(true);
  await page.clock.runFor(90000);
  await page.reload();
  await expect(page.locator('[data-clock]')).toContainText('1:30 elapsed');
  await expect(page.locator('.keyboard-key.is-selected').first()).toBeVisible();
  expect(await page.evaluate(async () => (await caches.keys()).every(key => key.startsWith('daily-pwa-')))).toBe(true);
});
