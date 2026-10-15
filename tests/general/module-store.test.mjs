import test from 'node:test';
import assert from 'node:assert/strict';
import { createDailyState } from '../../packages/data/src/daily-state.js';

async function setup() {
  const { createModuleStore } = await import('../../packages/data/src/module-store.js');
  const values = new Map();
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  const state = createDailyState(storage);
  const options = { id: 'plants', version: 1, initial: () => [], validate: value => Array.isArray(value) && value.every(item => typeof item === 'string') };
  return { state, storage, values, module: createModuleStore(state, options), createModuleStore, options };
}

test('module defaults never write and saved payloads preserve unrelated preferences and records', async () => {
  const { state, module, values } = await setup();
  assert.deepEqual(module.read(), []);
  assert.equal(values.size, 0);
  state.updatePreferences({ language: 'es' });
  module.save(['Fern 🌱']);
  assert.deepEqual(module.read(), ['Fern 🌱']);
  assert.equal(state.read().value.preferences.language, 'es');
});

test('module reads validate domain shapes and reject future versions without overwriting', async () => {
  const { state, storage, module } = await setup();
  const document = state.read().value;
  for (const payload of [{ version: 1, data: [42] }, { version: 2, data: [] }]) {
    document.modules.plants = payload;
    const raw = JSON.stringify(document);
    storage.setItem('daily:v1', raw);
    assert.throws(() => module.read(), /invalid|unsupported/i);
    assert.throws(() => module.save([]), /invalid|unsupported/i);
    assert.equal(storage.getItem('daily:v1'), raw);
  }
});

test('module saves re-read current state and publish only committed updates', async () => {
  const { state, storage, module, createModuleStore, options } = await setup();
  const second = createModuleStore(createDailyState(storage), { ...options, id: 'coffee' });
  let events = 0;
  const stop = state.subscribe(() => events++);
  module.save(['Fern']);
  second.save(['Espresso']);
  module.save(['Fern', 'Aloe']);
  assert.deepEqual(second.read(), ['Espresso']);
  assert.equal(events, 2);
  assert.throws(() => module.save([42]), /invalid/i);
  assert.equal(events, 2);
  stop();
});

test('failed module commits retain previous readable data without success notifications', async () => {
  const { state, module, storage } = await setup();
  module.save(['Fern']);
  let events = 0;
  state.subscribe(() => events++);
  storage.setItem = () => { throw new Error('QuotaExceededError'); };
  assert.throws(() => module.save(['Aloe']), /QuotaExceededError/);
  assert.deepEqual(module.read(), ['Fern']);
  assert.equal(events, 0);
});
