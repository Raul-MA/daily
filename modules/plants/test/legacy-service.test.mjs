import test from 'node:test';
import assert from 'node:assert/strict';
import { createDailyState } from '../../../packages/data/src/daily-state.js';
import { connectPlants } from '../src/service.js';
import { makeDocument } from '../src/store/envelope.js';

const record = { id: 'fern-1', name: 'Helecho 🌱', dateAdded: '2026-07-01T12:00:00Z', notes: 'Mi nota', schedule: { wateringIntervalDays: 7, nextDueOverrides: { watering: '2026-10-20' } }, careLog: [{ id: 'care-1', type: 'watering', date: '2026-10-13', note: 'Agua 💧' }] };
const things = { enabled: true, project: 'Casa 🪴' };
function storage(input = {}) {
  const values = new Map(Object.entries(input).map(([key, value]) => [key, JSON.stringify(value)]));
  const allowed = ['plantTracker_plants', 'plantTracker_plants_pending', 'plantTracker_plants_backup_1', 'plantTracker_plants_backup_2', 'stillgreen_things_settings'];
  const port = { getItem: key => { assert.ok(allowed.includes(key)); return values.get(key) ?? null; }, setItem: () => assert.fail('Export wrote original storage'), removeItem: () => assert.fail('Export removed original storage') };
  return { port, values };
}
function importIntoDaily(text) {
  const values = new Map();
  const state = createDailyState({ getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) });
  const service = connectPlants(state);
  try { service.applyImport(service.previewImport(text)); return state.read().value.modules.plants.data; }
  finally { service.stop(); }
}
async function exporter() { return (await import('../../../legacy/exporters/plants/export.js')).exportLegacyPlants; }

test('legacy plant export retains records care dates Unicode and Things preferences through actual Daily import', async () => {
  const exportLegacyPlants = await exporter();
  for (const plants of [[record], makeDocument([record], 7)]) {
    const legacy = storage({ plantTracker_plants: plants, stillgreen_things_settings: things });
    legacy.values.set('unrelated-token', 'fixture-private-token');
    const before = [...legacy.values];
    const text = exportLegacyPlants(legacy.port);
    const incoming = JSON.parse(text);
    assert.equal(incoming.app, 'stillgreen');
    assert.equal(incoming.version, 1);
    assert.deepEqual(incoming.plants, [record]);
    assert.deepEqual(incoming.things, things);
    assert.equal(text.includes('fixture-private-token'), false);
    const data = importIntoDaily(text);
    assert.deepEqual(data.plants, [record]);
    assert.deepEqual(data.things, things);
    assert.deepEqual([...legacy.values], before);
  }
});

test('legacy plant exporter reads the first valid recovery in original priority without repairing original keys', async () => {
  const exportLegacyPlants = await exporter();
  const legacy = storage({ plantTracker_plants_pending: makeDocument([record], 2), plantTracker_plants_backup_1: makeDocument([{ ...record, name: 'Older' }], 1) });
  legacy.values.set('plantTracker_plants', '{broken');
  const before = [...legacy.values];
  assert.equal(JSON.parse(exportLegacyPlants(legacy.port)).recoverySource, 'plantTracker_plants_pending');
  assert.deepEqual(JSON.parse(exportLegacyPlants(legacy.port)).plants, [record]);
  assert.deepEqual([...legacy.values], before);
  legacy.values.set('plantTracker_plants_pending', '{broken too');
  assert.equal(JSON.parse(exportLegacyPlants(legacy.port)).plants[0].name, 'Older');
  legacy.values.set('plantTracker_plants_backup_1', '{broken also');
  assert.throws(() => exportLegacyPlants(legacy.port), /invalid|recover|readable/i);
  legacy.values.set('plantTracker_plants', JSON.stringify({ schemaVersion: 99, plants: [record] }));
  legacy.values.set('plantTracker_plants_backup_1', JSON.stringify(makeDocument([record])));
  assert.throws(() => exportLegacyPlants(legacy.port), /unsupported|version/i);
});

test('legacy plant exporter keeps empty storage read-only and refuses invalid settings checksums or blocked storage', async () => {
  const exportLegacyPlants = await exporter();
  const empty = storage();
  const backup = JSON.parse(exportLegacyPlants(empty.port));
  assert.deepEqual(backup.plants, []);
  assert.deepEqual(backup.things, { enabled: false, project: '' });
  assert.equal(empty.values.size, 0);
  for (const settings of [null, { enabled: true, project: '' }, { enabled: 'yes', project: 'Casa' }]) {
    const legacy = storage({ plantTracker_plants: [record], stillgreen_things_settings: settings });
    const before = [...legacy.values];
    assert.throws(() => exportLegacyPlants(legacy.port), /invalid|settings/i);
    assert.deepEqual([...legacy.values], before);
  }
  const invalid = storage({ plantTracker_plants: { ...makeDocument([record]), checksum: 'invalid' } });
  assert.throws(() => exportLegacyPlants(invalid.port), /invalid|recover|readable/i);
  assert.throws(() => exportLegacyPlants({ getItem: () => { throw new Error('Storage blocked'); } }), /blocked/);
});
