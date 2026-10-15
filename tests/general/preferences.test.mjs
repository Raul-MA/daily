import test from 'node:test';
import assert from 'node:assert/strict';

const load = () => import('../../packages/data/src/daily-state.js');

class MemoryStorage {
  values = new Map();
  fail = false;
  getItem(key) { return this.values.get(key) ?? null; }
  setItem(key, value) {
    if (this.fail) throw new Error('QuotaExceededError');
    this.values.set(key, value);
  }
}

async function setup() {
  const { createDailyState, DAILY_KEY } = await load();
  const storage = new MemoryStorage();
  return { storage, state: createDailyState(storage, 'en'), createDailyState, DAILY_KEY };
}

test('fresh dashboard defaults put plants and activities first without writing data', async () => {
  const { state, storage } = await setup();
  assert.deepEqual(state.read().value.preferences.widgets, ['plants', 'activities', 'review', 'reader', 'quick', 'piano']);
  assert.equal(state.read().value.preferences.language, 'en');
  assert.equal(storage.values.size, 0);
});

test('language and dashboard order persist across a new state instance', async () => {
  const { state, storage, createDailyState } = await setup();
  state.updatePreferences({ language: 'es', widgets: ['activities', 'plants'] });
  const reloaded = createDailyState(storage, 'en');
  assert.equal(reloaded.read().value.preferences.language, 'es');
  assert.deepEqual(reloaded.read().value.preferences.widgets, ['activities', 'plants']);
});

test('removing a widget preserves module records and their active sessions', async () => {
  const { state, storage, DAILY_KEY } = await setup();
  const document = state.read().value;
  document.modules['time-budget'] = { version: 1, data: { active: { id: 'budget-1', status: 'running', name: 'Concentración 🌱' } } };
  storage.setItem(DAILY_KEY, JSON.stringify(document));
  state.updatePreferences({ widgets: ['plants'] });
  assert.deepEqual(state.read().value.modules, document.modules);
  state.updatePreferences({ language: 'es' });
  assert.equal(state.read().value.modules['time-budget'].data.active.name, 'Concentración 🌱');
});

test('invalid language, duplicate widgets and unknown actions never overwrite settings', async () => {
  const { state, storage } = await setup();
  state.updatePreferences({ language: 'es' });
  const before = [...storage.values];
  for (const patch of [{ language: 'fr' }, { widgets: ['plants', 'plants'] }, { quickActions: ['erase-records'] }]) {
    assert.throws(() => state.updatePreferences(patch), /invalid|unsupported/i);
    assert.deepEqual([...storage.values], before);
  }
});

test('failed saves publish no committed change and retain the previous preferences', async () => {
  const { state, storage } = await setup();
  state.updatePreferences({ language: 'en' });
  let events = 0;
  state.subscribe(() => events++);
  storage.fail = true;
  assert.throws(() => state.updatePreferences({ language: 'es' }), /QuotaExceededError/);
  assert.equal(events, 0);
  assert.equal(state.read().value.preferences.language, 'en');
});

test('committed preference changes notify subscribers and support cleanup', async () => {
  const { state } = await setup();
  const seen = [];
  const stop = state.subscribe(() => seen.push(state.read().value.preferences.language));
  state.updatePreferences({ language: 'es' });
  stop();
  state.updatePreferences({ language: 'en' });
  assert.deepEqual(seen, ['es']);
});
