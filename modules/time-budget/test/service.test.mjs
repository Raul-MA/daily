import test from 'node:test';
import assert from 'node:assert/strict';
import { createDailyState } from '../../../packages/data/src/daily-state.js';
import { createActivities, activityTime } from '../../../packages/platform/src/activities.js';

async function setup() {
  const { connectTimeBudget } = await import('../src/service.js');
  const values = new Map();
  const writes = [];
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => { writes.push(key); values.set(key, value); } };
  const state = createDailyState(storage);
  const service = connectTimeBudget(state);
  return { state, service, values, writes, storage };
}
function session() {
  return {
    id: 'budget-one', goalTime: '13:00', startTime: Date.now(), currentTaskIndex: 0,
    timerRunning: false, timerStartTime: null, timerElapsed: 0,
    tasks: [{ id: 1, name: 'Focus 🌱', allocatedMinutes: 5, actualMinutes: null, status: 'active' }, { id: 2, name: 'Read', allocatedMinutes: 10, actualMinutes: null, status: 'pending' }],
  };
}
function saveSession(service, value) { return service.save({ ...service.read(), session: value }); }

test('time budget reads are write-free and writes preserve shared language and other modules', async () => {
  const { state, service, values } = await setup();
  assert.deepEqual(service.read().templates, {});
  assert.equal(service.read().session, null);
  assert.equal(values.size, 0);
  state.commit(current => ({ ...current, modules: { plants: { version: 1, data: ['Keep'] } } }));
  state.updatePreferences({ language: 'es' });
  service.save({ ...service.read(), templates: { 'Mañana': [{ name: 'Café ☕', minutes: 5 }] } });
  assert.equal(state.read().value.preferences.language, 'es');
  assert.deepEqual(state.read().value.modules.plants.data, ['Keep']);
  assert.ok([...values.keys()].every(key => key.startsWith('daily:v1')));
});

test('time budget start and its paused activity commit atomically beside independent countdowns', async () => {
  const { state, service, writes } = await setup();
  const activities = createActivities(state);
  activities.start({ id: 'tea', kind: 'countdown', reference: 'tea', label: 'Tea', durationMs: 60000 });
  writes.length = 0;
  saveSession(service, session());
  assert.equal(writes.filter(key => key === 'daily:v1').length, 1);
  assert.equal(activities.list().find(item => item.kind === 'budget').status, 'paused');
  assert.equal(activities.list().find(item => item.kind === 'countdown').status, 'running');
});

test('running task timestamps reconstruct overtime without writes and explicit completion ends the activity', async () => {
  const { service, state, writes } = await setup();
  const current = session();
  current.timerRunning = true;
  current.timerStartTime = Date.now() - 390000;
  saveSession(service, current);
  const activity = createActivities(state).list()[0];
  assert.equal(activityTime(activity, current.timerStartTime + 390000).elapsedMs, 390000);
  const before = writes.length;
  assert.equal(service.read().session.timerStartTime, current.timerStartTime);
  assert.equal(writes.length, before);
  saveSession(service, null);
  assert.equal(createActivities(state).list()[0].status, 'completed');
});

test('failed budget writes do not change tasks timestamps activities or the primary root', async () => {
  const { service, state, values, storage } = await setup();
  saveSession(service, session());
  const root = state.read().value;
  const primary = values.get('daily:v1');
  storage.setItem = () => { throw new Error('QuotaExceededError'); };
  assert.throws(() => saveSession(service, { ...session(), timerElapsed: 90000 }), /QuotaExceeded/);
  assert.equal(values.get('daily:v1'), primary);
  assert.deepEqual(state.read().value, root);
});

test('stale budget views cannot overwrite later task changes', async () => {
  const { service } = await setup();
  const stale = service.read();
  saveSession(service, session());
  assert.throws(() => service.save({ ...stale, templates: { Stale: [{ name: 'Old', minutes: 5 }] } }), /changed/i);
  assert.equal(service.read().session.id, 'budget-one');
  assert.deepEqual(service.read().templates, {});
});

test('legacy template previews merge only on confirmation while migration exports include active timing', async () => {
  const { service, values } = await setup();
  saveSession(service, session());
  const before = [...values];
  const preview = service.previewImport(JSON.stringify({ 'Plan 🌱': [{ name: 'Read', minutes: 12 }] }));
  assert.equal(preview.counts.templates, 1);
  assert.deepEqual([...values], before);
  service.applyImport(preview);
  assert.equal(service.read().session.id, 'budget-one');
  assert.deepEqual(JSON.parse(service.exportTemplates()), { 'Plan 🌱': [{ name: 'Read', minutes: 12 }] });
  const migration = JSON.parse(service.exportMigration());
  assert.equal(migration.session.id, 'budget-one');
  assert.equal(migration.session.timerElapsed, 0);
  assert.ok(values.has('daily:v1:recovery'));
  assert.throws(() => service.applyImport(preview));
});

test('migration imports retain active timestamps and reject stale or changed previews', async () => {
  const { service, state } = await setup();
  const incoming = { app: 'time-budget', schemaVersion: 1, templates: {}, session: { ...session(), timerRunning: true, timerStartTime: Date.now() - 90000 } };
  const preview = service.previewImport(JSON.stringify(incoming));
  service.applyImport(preview);
  assert.equal(service.read().session.timerStartTime, incoming.session.timerStartTime);
  const stale = service.previewImport(JSON.stringify(incoming));
  state.updatePreferences({ language: 'es' });
  assert.throws(() => service.applyImport(stale), /changed/i);
  const altered = service.previewImport(JSON.stringify(incoming));
  altered.data.session.tasks[0].allocatedMinutes = 99;
  assert.throws(() => service.applyImport(altered), /changed|preview/i);
});

test('budget validation rejects future schemas duplicate tasks invalid timers and future root modules without changes', async () => {
  const { service, state, values } = await setup();
  const current = session();
  const invalid = [
    { ...current, goalTime: '24:00' }, { ...current, timerElapsed: -1 },
    { ...current, timerRunning: true, timerStartTime: null },
    { ...current, tasks: [current.tasks[0], current.tasks[0]] },
    { ...current, currentTaskIndex: 4 },
  ];
  for (const value of invalid) assert.throws(() => saveSession(service, value), /invalid/i);
  assert.equal(values.size, 0);
  assert.throws(() => service.previewImport(JSON.stringify({ app: 'time-budget', schemaVersion: 99, templates: {}, session: current })), /version|schema/i);
  state.commit(root => ({ ...root, modules: { 'time-budget': { version: 99, data: {} } } }));
  const before = [...values];
  assert.throws(() => service.read(), /version/i);
  assert.deepEqual([...values], before);
});

test('full Time Budget backups restore independent countdowns atomically beside the plan', async () => {
  const { service, state, writes } = await setup();
  saveSession(service, session());
  service.countdowns.start('Tea ☕', 2);
  service.countdowns.start('Stretch', 5);
  const exported = JSON.parse(service.exportMigration());
  assert.equal(exported.countdowns.length, 2);
  service.countdowns.transition(exported.countdowns[0].id, 'paused');
  const preview = service.previewImport(JSON.stringify(exported));
  assert.equal(preview.counts.countdowns, 2);
  writes.length = 0;
  service.applyImport(preview);
  assert.equal(writes.filter(key => key === 'daily:v1').length, 1);
  assert.deepEqual(service.countdowns.list(), exported.countdowns);
  assert.equal(state.read().value.modules['time-budget'].data.session.id, 'budget-one');
  const primary = state.read().value;
  exported.countdowns[0].kind = 'game';
  assert.throws(() => service.previewImport(JSON.stringify(exported)), /invalid/i);
  assert.deepEqual(state.read().value, primary);
});

test('time budget rejects unrenderable saved timestamps and counters before any root write', async () => {
  const { service, values } = await setup();
  const saved = session();
  for (const [key, number] of [['startTime', 1e100], ['timerStartTime', 8640000000000001], ['timerElapsed', 1e100]]) {
    const invalid = { ...saved, [key]: number };
    assert.throws(() => saveSession(service, invalid), /invalid/i, key);
    assert.equal(values.size, 0);
  }
  saveSession(service, saved);
  assert.equal(service.read().session.startTime, saved.startTime);
});
