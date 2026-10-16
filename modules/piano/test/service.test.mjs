import test from 'node:test';
import assert from 'node:assert/strict';
import { createDailyState } from '../../../packages/data/src/daily-state.js';
import { createActivities } from '../../../packages/platform/src/activities.js';

async function setup() {
  const { connectPiano } = await import('../src/service.js');
  const values = new Map();
  const writes = [];
  let now = 1792065600000;
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => { writes.push(key); values.set(key, value); } };
  const state = createDailyState(storage);
  const service = connectPiano(state, () => now);
  return { service, state, values, writes, storage, advance: milliseconds => { now += milliseconds; } };
}
function start(service) { return service.startSession({ lessonId: 'interval-foundations', minutes: 10, piano: true }); }

test('piano reads and random selection never create a practice record and explicit exercise opening persists the last ID', async () => {
  const { service, values } = await setup();
  assert.equal(service.read().practice, null);
  assert.equal(service.read().lastExerciseId, null);
  assert.ok(service.pickExercise(() => 0).endsWith('.practice'));
  assert.equal(values.size, 0);
  service.openExercise('intervals.practice');
  assert.equal(service.read().lastExerciseId, 'intervals.practice');
  assert.equal(service.read().practice, null);
  assert.throws(() => service.openExercise('missing'), /unknown/i);
});

test('piano start saves its practice and timestamp activity atomically and offers the existing unfinished session', async () => {
  const { service, state, writes } = await setup();
  const session = start(service);
  assert.equal(writes.filter(key => key === 'daily:v1').length, 1);
  const activity = createActivities(state).list().find(item => item.kind === 'piano');
  assert.equal(activity.reference, session.id);
  assert.equal(activity.status, 'running');
  assert.deepEqual(session.budgets, [60, 180, 300, 60]);
  const before = writes.length;
  const existing = service.startSession({ lessonId: 'rhythm-and-motif', minutes: 5, piano: false });
  assert.equal(existing.id, session.id);
  assert.equal(writes.length, before);
});

test('piano elapsed and current block reconstruct after suspension without writes or automatic completion', async () => {
  const { service, advance, values, state } = await setup();
  start(service);
  const before = [...values];
  advance(90000);
  assert.equal(service.snapshot().elapsedMs, 90000);
  assert.deepEqual(service.snapshot().blockElapsedMs, [90000, 0, 0, 0]);
  assert.deepEqual([...values], before);
  const { connectPiano } = await import('../src/service.js');
  const resumed = connectPiano(state, () => 1792065690000);
  assert.equal(resumed.snapshot().elapsedMs, 90000);
  advance(600000);
  assert.equal(service.snapshot().status, 'running');
  assert.equal(service.read().history.length, 0);
});

test('piano explicit pause freezes clocks and block changes preserve already practiced time', async () => {
  const { service, advance } = await setup();
  start(service);
  advance(15000);
  service.setBlock(1);
  advance(10000);
  service.pause();
  const paused = service.snapshot();
  advance(60000);
  assert.deepEqual(service.snapshot(), paused);
  service.resume();
  advance(5000);
  assert.equal(service.snapshot().elapsedMs, 30000);
  assert.deepEqual(service.snapshot().blockElapsedMs, [15000, 15000, 0, 0]);
});

test('piano snapshots keep prompt and reveal stable until a presentation transition explicitly advances', async () => {
  const { service, advance, values } = await setup();
  start(service);
  service.setBlock(1);
  service.configurePacing({ auto: true, pace: 30 });
  service.reveal();
  const prompt = service.snapshot().prompt;
  const before = [...values];
  advance(90000);
  assert.equal(service.snapshot().elapsedMs, 90000);
  assert.equal(service.snapshot().promptIndex, 0);
  assert.equal(service.snapshot().revealed, true);
  assert.deepEqual(service.snapshot().prompt, prompt);
  assert.deepEqual([...values], before);
  service.pause(10000);
  advance(60000);
  assert.equal(service.snapshot().promptElapsedMs, 10000);
  service.resume(10000);
  service.nextPrompt();
  assert.equal(service.snapshot().promptIndex, 1);
  assert.equal(service.snapshot().revealed, false);
  assert.equal(service.read().practice.promptIndex, 1);
});

test('piano explicit finish records practice once and atomically completes its activity', async () => {
  const { service, state, advance, writes } = await setup();
  const session = start(service);
  advance(90000);
  writes.length = 0;
  service.finishSession();
  assert.equal(writes.filter(key => key === 'daily:v1').length, 1);
  assert.equal(service.read().practice, null);
  assert.equal(service.read().history[0].id, session.id);
  assert.equal(service.read().history[0].elapsedMs, 90000);
  assert.equal(createActivities(state).list()[0].status, 'completed');
  service.finishSession();
  assert.equal(service.read().history.length, 1);
});

test('piano failed saves retain the previous practice history and activity without partial commits', async () => {
  const { service, state, storage } = await setup();
  start(service);
  const before = state.read().value;
  storage.setItem = () => { throw new Error('QuotaExceededError'); };
  assert.throws(() => service.pause(), /QuotaExceeded/);
  assert.deepEqual(state.read().value, before);
  assert.equal(service.snapshot().status, 'running');
  assert.throws(() => service.finishSession(), /QuotaExceeded/);
  assert.deepEqual(state.read().value, before);
});

test('piano future data and invalid lessons pacing or blocks reject without changing stored records', async () => {
  const { service, state, values } = await setup();
  assert.throws(() => service.startSession({ lessonId: 'unknown', minutes: 10, piano: true }), /unknown|invalid/i);
  assert.throws(() => service.startSession({ lessonId: 'interval-foundations', minutes: 2, piano: true }), /minute|invalid/i);
  assert.equal(values.size, 0);
  start(service);
  const before = state.read().value;
  assert.throws(() => service.setBlock(9), /block|invalid/i);
  assert.throws(() => service.configurePacing({ auto: true, pace: 0 }), /pace|second|invalid/i);
  assert.deepEqual(state.read().value, before);
  state.commit(root => ({ ...root, modules: { ...root.modules, piano: { version: 99, data: {} } } }));
  const future = [...values];
  assert.throws(() => service.read(), /version/i);
  assert.deepEqual([...values], future);
});
