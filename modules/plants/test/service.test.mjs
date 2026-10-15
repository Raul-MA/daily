import test from 'node:test';
import assert from 'node:assert/strict';
import { createDailyState } from '../../../packages/data/src/daily-state.js';
import { loadModule } from '../../../tests/support/load-module.mjs';

const load = () => import('../src/service.js');
const plant = (id = 'fern-1') => ({ id, name: 'Helecho 🌱', dateAdded: '2026-07-01T12:00:00Z', schedule: { wateringIntervalDays: 7, soilIntervalMonths: 12, fertilizerIntervalWeeks: 4 }, careLog: [] });
async function setup(t) {
  const { connectPlants } = await load();
  const values = new Map();
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  const state = createDailyState(storage);
  const service = connectPlants(state);
  t.after(service.stop);
  const store = await loadModule('plants', 'store/store.js');
  const things = await loadModule('plants', 'integrations/things.js');
  return { state, service, values, storage, store, things };
}

test('connected plant storage writes only the shared document and preserves other modules', async t => {
  const { state, store, values } = await setup(t);
  state.commit(current => ({ ...current, modules: { coffee: { version: 1, data: ['Preserve'] } } }));
  store.addPlant(plant());
  assert.deepEqual(store.getPlants(), [plant()]);
  assert.deepEqual(state.read().value.modules.coffee.data, ['Preserve']);
  assert.equal(state.read().value.modules.plants.data.backup.changesSinceExport, 1);
  assert.ok([...values.keys()].every(key => key.startsWith('daily:v1')));
});

test('connected care and due-date changes remain one root commit with no partial state', async t => {
  const { state, store, storage } = await setup(t);
  store.addPlant(plant());
  let writes = 0;
  const original = storage.setItem;
  storage.setItem = (key, value) => { if (key === 'daily:v1') writes++; return original(key, value); };
  const entry = { id: 'skip-1', type: 'skip', careType: 'watering', date: '2026-07-25', note: 'Aún húmeda' };
  store.addCareLogAndSetNextDue('fern-1', entry, 'watering', '2026-07-30');
  assert.equal(writes, 1);
  const saved = state.read().value.modules.plants.data.plants[0];
  assert.deepEqual(saved.careLog, [entry]);
  assert.equal(saved.schedule.nextDueOverrides.watering, '2026-07-30');
});

test('Things settings live with plant records and survive a plant update', async t => {
  const { state, store, things } = await setup(t);
  things.saveThingsSettings({ enabled: true, project: '  Plantas de casa  ' });
  store.addPlant(plant());
  store.updatePlant('fern-1', { name: 'Nombre nuevo' });
  assert.deepEqual(things.getThingsSettings(), { enabled: true, project: 'Plantas de casa' });
  assert.deepEqual(state.read().value.modules.plants.data.things, things.getThingsSettings());
});

test('legacy import previews are read-only and confirmation keeps a root recovery copy', async t => {
  const { service, store, values, state } = await setup(t);
  store.addPlant(plant());
  const before = [...values];
  const preview = service.previewImport(JSON.stringify([plant('new-id')]));
  assert.equal(preview.count, 1);
  assert.deepEqual([...values], before);
  const oldRoot = state.read().value;
  service.applyImport(preview);
  assert.equal(store.getPlants()[0].id, 'new-id');
  assert.equal(state.read().value.modules.plants.data.backup.changesSinceExport, oldRoot.modules.plants.data.backup.changesSinceExport + 1);
  assert.deepEqual(JSON.parse(values.get('daily:v1:recovery')), oldRoot);
});

test('migration export includes Things settings and imports without translating user text', async t => {
  const { service, store, things } = await setup(t);
  store.addPlant(plant());
  things.saveThingsSettings({ enabled: true, project: 'Casa 🏡' });
  const backup = service.exportMigration();
  const preview = service.previewImport(backup);
  store.deletePlant('fern-1');
  assert.throws(() => service.applyImport(preview), /changed|cambi/i);
  service.applyImport(service.previewImport(backup));
  assert.equal(store.getPlants()[0].name, 'Helecho 🌱');
  assert.equal(things.getThingsSettings().project, 'Casa 🏡');
});

test('unsupported duplicate and invalid plant imports never mutate shared data', async t => {
  const { service, store, values } = await setup(t);
  store.addPlant(plant());
  const before = [...values];
  for (const value of [[plant(), plant()], [plant(null)], { app: 'stillgreen', version: 99, plants: [] }, [{ ...plant(), careLog: [{ id: 'bad', type: 'delete-all', date: '2026-07-25' }] }]]) {
    assert.throws(() => service.previewImport(JSON.stringify(value)));
    assert.deepEqual([...values], before);
  }
});

test('quota failure retains plant history and sends no successful shared change', async t => {
  const { state, storage, store } = await setup(t);
  store.addPlant(plant());
  let events = 0;
  state.subscribe(() => events++);
  storage.setItem = () => { throw new Error('QuotaExceededError'); };
  assert.throws(() => store.addCareLog('fern-1', { id: 'water-1', type: 'watering', date: '2026-07-25' }), /QuotaExceededError/);
  assert.equal(store.getPlant('fern-1').careLog.length, 0);
  assert.equal(events, 0);
});

test('template care refresh preserves names notes history IDs and manual dates', async t => {
  const { store } = await setup(t);
  const item = { ...plant(), templateId: 'xanadu', name: 'Mi planta', notes: 'Mi nota', schedule: { nextDueOverrides: { watering: '2026-07-30' } } };
  store.addPlant(item);
  const result = store.updatePlantCareFromTemplates([{ id: 'xanadu', species: 'Thaumatophyllum xanadu', schedule: { wateringIntervalDays: 14 } }]);
  assert.deepEqual(result, { total: 1, matched: 1, updated: 1, unmatched: 0 });
  const saved = store.getPlant('fern-1');
  assert.equal(saved.name, item.name);
  assert.equal(saved.notes, item.notes);
  assert.deepEqual(saved.careLog, item.careLog);
  assert.equal(saved.schedule.wateringIntervalDays, 14);
  assert.equal(saved.schedule.nextDueOverrides.watering, '2026-07-30');
});
