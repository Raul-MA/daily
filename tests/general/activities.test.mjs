import test from 'node:test';
import assert from 'node:assert/strict';
import { createDailyState } from '../../packages/data/src/daily-state.js';

async function setup() {
  const { createActivities, activityTime } = await import('../../packages/platform/src/activities.js');
  const values = new Map();
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  const state = createDailyState(storage);
  let now = 1000;
  const clock = () => now;
  return { state, storage, createActivities, activityTime, activities: createActivities(state, clock), clock, at: value => { now = value; } };
}

const countdown = { id: 'timer-1', kind: 'countdown', label: 'Té 🍵', durationMs: 60000, reference: 'timer-1' };

test('time is derived from timestamps without tick writes or automatic completion', async () => {
  const { activities, activityTime, storage, at } = await setup();
  activities.start(countdown);
  const before = storage.getItem('daily:v1');
  at(91000);
  const item = activities.list()[0];
  assert.deepEqual(activityTime(item, 91000), { elapsedMs: 90000, remainingMs: -30000, overdue: true });
  assert.equal(item.status, 'running');
  assert.equal(storage.getItem('daily:v1'), before);
});

test('reload and process reconstruction preserve elapsed time and Unicode references', async () => {
  const { activities, createActivities, storage, clock, at, activityTime } = await setup();
  activities.start(countdown);
  at(121000);
  const reloaded = createActivities(createDailyState(storage), clock);
  assert.equal(reloaded.list()[0].label, 'Té 🍵');
  assert.equal(activityTime(reloaded.list()[0], clock()).elapsedMs, 120000);
});

test('explicit pause excludes background time and resume continues the same activity', async () => {
  const { activities, activityTime, at, clock } = await setup();
  activities.start(countdown);
  at(21000);
  activities.transition('timer-1', 'paused');
  at(121000);
  assert.equal(activityTime(activities.list()[0], clock()).elapsedMs, 20000);
  activities.transition('timer-1', 'running');
  at(131000);
  assert.equal(activityTime(activities.list()[0], clock()).elapsedMs, 30000);
  assert.equal(activities.list()[0].startedAt, 1000);
});

test('countdowns are independent and singleton budgets games and piano resume existing activities', async () => {
  const { activities } = await setup();
  activities.start(countdown);
  activities.start({ ...countdown, id: 'timer-2', reference: 'timer-2' });
  for (const kind of ['budget', 'game', 'piano']) {
    const original = activities.start({ ...countdown, kind, id: kind });
    const existing = activities.start({ ...countdown, kind, id: `${kind}-new` });
    assert.equal(existing.id, original.id);
  }
  assert.equal(activities.list().length, 5);
});

test('widget removal language changes and navigation do not pause or reset activities', async () => {
  const { state, activities, at, clock, activityTime } = await setup();
  activities.start(countdown);
  state.updatePreferences({ widgets: [], language: 'es' });
  at(61000);
  assert.equal(activities.list()[0].status, 'running');
  assert.equal(activityTime(activities.list()[0], clock()).elapsedMs, 60000);
});

test('completion is explicit and terminal while a new budget may start afterwards', async () => {
  const { activities, at, clock, activityTime } = await setup();
  activities.start({ ...countdown, kind: 'budget' });
  at(11000);
  activities.transition('timer-1', 'completed');
  at(21000);
  const completed = activities.list()[0];
  assert.equal(activityTime(completed, clock()).elapsedMs, 10000);
  assert.throws(() => activities.transition('timer-1', 'running'), /completed/i);
  assert.equal(activities.start({ ...countdown, kind: 'budget', id: 'new' }).id, 'new');
});

test('duration adjustment preserves elapsed time and backward clock changes never create negative elapsed time', async () => {
  const { activities, at, clock, activityTime } = await setup();
  activities.start(countdown);
  at(21000);
  activities.adjust('timer-1', 10000);
  assert.equal(activityTime(activities.list()[0], clock()).remainingMs, -10000);
  at(0);
  assert.equal(activityTime(activities.list()[0], clock()).elapsedMs, 0);
});

test('invalid starts duplicate identifiers and unknown transitions never mutate activities', async () => {
  const { activities, storage } = await setup();
  activities.start(countdown);
  const raw = storage.getItem('daily:v1');
  for (const patch of [{ durationMs: -1 }, { durationMs: NaN }, { label: '' }, { kind: 'other' }]) {
    assert.throws(() => activities.start({ ...countdown, id: 'bad', ...patch }), /invalid/i);
  }
  assert.throws(() => activities.start(countdown), /duplicate/i);
  assert.throws(() => activities.transition('missing', 'paused'), /unknown/i);
  assert.throws(() => activities.transition('timer-1', 'invalid'), /invalid/i);
  assert.equal(storage.getItem('daily:v1'), raw);
});

test('failed activity changes keep the previous status and publish no success', async () => {
  const { activities, state, storage, at } = await setup();
  activities.start(countdown);
  let events = 0;
  state.subscribe(() => events++);
  storage.setItem = () => { throw new Error('QuotaExceededError'); };
  at(21000);
  assert.throws(() => activities.transition('timer-1', 'paused'), /QuotaExceededError/);
  assert.equal(activities.list()[0].status, 'running');
  assert.equal(events, 0);
});
