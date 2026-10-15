import test from 'node:test';
import assert from 'node:assert/strict';

async function setup(t, initial) {
  const { watchCalendar } = await import('../../packages/platform/src/calendar.js');
  const browser = new EventTarget();
  browser.document = new EventTarget();
  browser.document.visibilityState = 'visible';
  const scheduled = new Map();
  const canceled = [];
  let id = 0;
  let now = new Date(initial).getTime();
  let changes = 0;
  browser.setTimeout = (callback, delay) => { scheduled.set(++id, { callback, delay }); return id; };
  browser.clearTimeout = key => { canceled.push(key); scheduled.delete(key); };
  const stop = watchCalendar(browser, () => changes++, () => new Date(now));
  t.after(stop);
  return { browser, scheduled, canceled, stop, changes: () => changes, at: date => { now = new Date(date).getTime(); } };
}

test('calendar refreshes at local midnight without repeated changes on the same day', async t => {
  const state = await setup(t, '2026-10-15T23:59:58');
  assert.equal([...state.scheduled.values()][0].delay, 3000);
  state.at('2026-10-16T00:00:02');
  [...state.scheduled.values()][0].callback();
  assert.equal(state.changes(), 1);
  state.browser.dispatchEvent(new Event('focus'));
  assert.equal(state.changes(), 1);
});

test('foreground resumes recalculate date after suspension and cleanup removes callbacks', async t => {
  const state = await setup(t, '2026-10-15T12:00:00');
  state.at('2026-10-17T12:00:00');
  state.browser.document.dispatchEvent(new Event('visibilitychange'));
  assert.equal(state.changes(), 1);
  state.stop();
  assert.equal(state.scheduled.size, 0);
  state.at('2026-10-18T12:00:00');
  state.browser.document.dispatchEvent(new Event('visibilitychange'));
  assert.equal(state.changes(), 1);
});

test('calendar deadlines follow daylight-saving local days rather than a fixed 24 hours', async t => {
  const previous = process.env.TZ;
  process.env.TZ = 'America/New_York';
  t.after(() => { if (previous === undefined) delete process.env.TZ; else process.env.TZ = previous; });
  const state = await setup(t, '2026-03-08T00:00:00');
  assert.equal([...state.scheduled.values()][0].delay, 23 * 3600000 + 1000);
});
