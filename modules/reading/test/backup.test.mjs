import test from 'node:test';
import assert from 'node:assert/strict';
import { createDailyState } from '../../../packages/data/src/daily-state.js';
import { document, response } from './source.mjs';

async function setup() {
  const { connectReading } = await import('../src/service.js');
  const values = new Map();
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
  const state = createDailyState(storage);
  const service = connectReading(state, { storage, sessionStorage: storage, fetch: async () => response([document('a')]) });
  service.setToken('fixture-private', 'session');
  await service.pick();
  return { service, state, values, storage };
}

test('Reader exports versioned settings and current picks without credentials or disposable pools', async () => {
  const { service } = await setup();
  const exported = JSON.parse(service.exportBackup());
  assert.equal(exported.app, 'daily-reading');
  assert.equal(exported.schemaVersion, 1);
  assert.equal(exported.data.picks.documents[0].id, 'a');
  assert.equal(exported.data.settings.count, 3);
  assert.equal(JSON.stringify(exported).includes('fixture-private'), false);
  assert.equal(Object.hasOwn(exported, 'cache'), false);
});

test('Reader legacy migration preview normalizes aliases and discards credentials without changing saved data', async () => {
  const { service, state } = await setup();
  const before = state.read().value;
  const input = { app: 'reader-picker', schemaVersion: 1, settings: { count: 5, locations: ['inbox', 'later'], token: 'never-import-this' }, lastItem: null };
  const preview = service.previewImport(JSON.stringify(input));
  assert.equal(preview.data.settings.count, 5);
  assert.deepEqual(preview.data.settings.locations, ['new', 'later']);
  assert.equal(preview.data.settings.policy, 'started-first');
  assert.equal(JSON.stringify(preview).includes('never-import-this'), false);
  assert.deepEqual(state.read().value, before);
  assert.throws(() => service.previewImport(JSON.stringify({ ...input, schemaVersion: 99 })), /version|unsupported/i);
  assert.deepEqual(state.read().value, before);
});

test('Reader replacement previews reject tampering and stale roots before mutation', async () => {
  const { service, state } = await setup();
  const preview = service.previewImport(service.exportBackup());
  const before = state.read().value;
  preview.data.settings.count = 7;
  assert.throws(() => service.applyImport(preview), /changed|preview/i);
  assert.deepEqual(state.read().value, before);
  const fresh = service.previewImport(service.exportBackup());
  state.updatePreferences({ language: 'es' });
  const after = state.read().value;
  assert.throws(() => service.applyImport(fresh), /changed|conflict/i);
  assert.deepEqual(state.read().value, after);
});

test('Reader confirmed restore preserves other modules and language while requiring token reentry', async () => {
  const { service, state, values } = await setup();
  state.commit(root => ({ ...root, preferences: { ...root.preferences, language: 'es' }, modules: { ...root.modules, fixture: { version: 1, data: { note: 'untouched' } } } }));
  const input = JSON.parse(service.exportBackup());
  input.data.settings.count = 7;
  const preview = service.previewImport(JSON.stringify(input));
  assert.equal(JSON.parse(service.exportRecovery()).modules.fixture.data.note, 'untouched');
  service.applyImport(preview);
  assert.equal(service.read().settings.count, 7);
  assert.equal(service.read().picks.documents[0].id, 'a');
  assert.equal(state.read().value.preferences.language, 'es');
  assert.equal(state.read().value.modules.fixture.data.note, 'untouched');
  assert.equal(service.token(), '');
  assert.equal(values.has('daily:readwise:session:v1'), false);
});

test('failed Reader restore retains previous primary records and credentials', async () => {
  const { service, state, storage } = await setup();
  const input = JSON.parse(service.exportBackup());
  input.data.settings.count = 7;
  const preview = service.previewImport(JSON.stringify(input));
  const before = state.read().value;
  storage.setItem = () => { throw new Error('QuotaExceededError'); };
  assert.throws(() => service.applyImport(preview), /QuotaExceeded/);
  assert.deepEqual(state.read().value, before);
  assert.equal(service.token(), 'fixture-private');
});
