import test from 'node:test';
import assert from 'node:assert/strict';
import { createDailyState } from '../../../packages/data/src/daily-state.js';
import { connectTimeBudget } from '../src/service.js';
import { activityTime } from '../../../packages/platform/src/activities.js';

const start = 1792065600000;
function session(running = true) {
  return { goalTime: '13:00', startTime: start, currentTaskIndex: 0, timerRunning: running, timerStartTime: running ? start : null, timerElapsed: running ? 0 : 90000,
    tasks: [{ id: 7, name: 'Leer 🌱', allocatedMinutes: 5, actualMinutes: null, status: 'active' }] };
}
function storage(input = {}) {
  const values = new Map(Object.entries(input).map(([key, value]) => [key, JSON.stringify(value)]));
  const reads = [];
  const port = { getItem: key => { reads.push(key); return values.get(key) ?? null; }, setItem: () => assert.fail('Legacy export wrote storage'), removeItem: () => assert.fail('Legacy export removed storage') };
  return { port, values, reads };
}
async function exporter() { return (await import('../../../legacy/exporters/time-budget/export.js')).exportLegacyBudget; }

test('legacy budget export preserves original running and paused clocks and imports through Daily without credentials', async () => {
  const exportLegacyBudget = await exporter();
  for (const running of [true, false]) {
    const old = session(running);
    const templates = { 'Mañana ☕': [{ name: 'Leer 🌱', minutes: 5 }] };
    const legacy = storage({ timeBudget_currentState: old, timeBudget_templates: templates, unrelated: { token: 'private-fixture' } });
    const before = [...legacy.values];
    const file = exportLegacyBudget(legacy.port);
    const backup = JSON.parse(file);
    assert.deepEqual({ ...backup.session, id: undefined }, { ...old, id: undefined });
    assert.deepEqual(backup.templates, templates);
    assert.equal(file.includes('private-fixture'), false);
    const values = new Map();
    const state = createDailyState({ getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) });
    const daily = connectTimeBudget(state);
    daily.applyImport(daily.previewImport(file));
    assert.equal(daily.read().session.timerStartTime, old.timerStartTime);
    assert.equal(daily.read().session.timerElapsed, old.timerElapsed);
    const activity = state.read().value.modules.activities.data[0];
    assert.equal(activityTime(activity, start + 600000).elapsedMs, running ? 600000 : 90000);
    assert.deepEqual([...legacy.values], before);
    assert.deepEqual([...new Set(legacy.reads)].sort(), ['timeBudget_currentState', 'timeBudget_templates']);
  }
});

test('legacy budget export assigns a stable session identity without initializing absent storage', async () => {
  const exportLegacyBudget = await exporter();
  const empty = storage();
  assert.deepEqual(JSON.parse(exportLegacyBudget(empty.port)), { app: 'time-budget', schemaVersion: 1, templates: {}, session: null });
  assert.equal(empty.values.size, 0);
  const legacy = storage({ timeBudget_currentState: session() });
  const first = JSON.parse(exportLegacyBudget(legacy.port));
  assert.ok(first.session.id.length > 0);
  assert.deepEqual(JSON.parse(exportLegacyBudget(legacy.port)), first);
});

test('legacy budget malformed records or blocked storage fail without resetting any original data', async () => {
  const exportLegacyBudget = await exporter();
  for (const input of [{ timeBudget_currentState: { ...session(), timerStartTime: null } }, { timeBudget_templates: { Broken: [] } }, { timeBudget_currentState: [] }]) {
    const legacy = storage(input);
    const before = [...legacy.values];
    assert.throws(() => exportLegacyBudget(legacy.port), /invalid|unsupported/i);
    assert.deepEqual([...legacy.values], before);
  }
  const broken = storage();
  broken.values.set('timeBudget_templates', '{broken');
  assert.throws(() => exportLegacyBudget(broken.port), SyntaxError);
  assert.equal(broken.values.get('timeBudget_templates'), '{broken');
  assert.throws(() => exportLegacyBudget({ getItem: () => { throw new Error('Storage blocked'); } }), /blocked/);
});
