import test from 'node:test';
import assert from 'node:assert/strict';
import { createDailyPicks, localDay } from '../src/daily.js';
import { createReviewNavigation } from '../src/review/navigation.js';

function fixture() {
  let now = new Date(2026, 9, 27, 12).getTime();
  const data = { settings: { count: 2 }, picks: null };
  let calls = 0;
  let failed = false;
  const daily = createDailyPicks({ read: () => data, token: () => 'fixture', now: () => now, emit: () => undefined, pick: async () => {
    calls++;
    if (failed) throw new Error('Offline');
    data.picks = { documents: [], selectedAt: now, settingsKey: JSON.stringify(data.settings) };
    return data.picks;
  } });
  return { daily, data, calls: () => calls, advance: () => { now = new Date(2026, 9, 28, 0, 1).getTime(); }, fail: () => { failed = true; } };
}

test('daily Reader reuses even empty picks until the next local day or saved settings change', async () => {
  const context = fixture();
  await Promise.all([context.daily.ensure(), context.daily.ensure()]);
  assert.equal(context.calls(), 1);
  await context.daily.ensure();
  assert.equal(context.calls(), 1);
  context.advance();
  await context.daily.ensure();
  assert.equal(context.calls(), 2);
  context.data.settings.count = 3;
  await context.daily.ensure();
  assert.equal(context.calls(), 3);
  await context.daily.refresh();
  assert.equal(context.calls(), 4);
  assert.equal(localDay(new Date(2026, 9, 28, 0, 1).getTime()), '2026-10-28');
});

test('daily Reader retains old picks on failure and retries only explicitly for the same day and settings', async () => {
  const context = fixture();
  await context.daily.ensure();
  const previous = context.data.picks;
  context.advance();
  context.fail();
  await assert.rejects(context.daily.ensure(), /Offline/);
  await context.daily.ensure();
  assert.equal(context.calls(), 2);
  assert.equal(context.data.picks, previous);
  assert.equal(context.daily.snapshot().status, 'error');
  await assert.rejects(context.daily.refresh(), /Offline/);
  assert.equal(context.calls(), 3);
});

test('review navigation survives recreation but resets for a different review or account and rejects corrupt indices', () => {
  const values = new Map();
  const storage = { getItem: key => values.get(key), setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
  let account = 'a';
  const options = { storage, accountId: () => account };
  const review = { id: '7', highlights: [{ id: 'one' }, { id: 'two' }] };
  createReviewNavigation(options).save(review, 1, false);
  assert.equal(createReviewNavigation(options).read(review).index, 1);
  assert.equal(createReviewNavigation(options).read({ ...review, id: '8' }).index, 0);
  account = 'b';
  assert.equal(createReviewNavigation(options).read(review).index, 0);
  createReviewNavigation(options).save(review, 100, true);
  assert.equal(createReviewNavigation(options).read(review).index, 1);
  createReviewNavigation(options).clear();
  assert.equal(createReviewNavigation(options).read(review).index, 0);
});
