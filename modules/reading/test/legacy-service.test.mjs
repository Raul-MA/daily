import test from 'node:test';
import assert from 'node:assert/strict';
import { createDailyState } from '../../../packages/data/src/daily-state.js';
import { connectReading } from '../src/service.js';
import { DEFAULTS } from '../src/config.js';

const settings = { locations: ['new', 'later'], progress: 'started', minutes: 15, count: 5, cacheMinutes: 20, scanLimit: 700, updateUrlOnPick: true, autoOpenSingle: false, rememberLastItem: true };
const item = { id: 'doc-1', url: 'https://read.readwise.io/read/doc-1', title: 'Artículo 🌱', reading_progress: 0.25, reading_time: 10, word_count: 1000, body: 'fixture-private-body', token: 'fixture-private-token' };
function storage(input = {}) {
  const values = new Map(Object.entries(input).map(([key, value]) => [key, JSON.stringify(value)]));
  const reads = [];
  const allowed = ['readerPicker.settings.v2', 'readerPicker.settings.v1', 'readerPicker.lastItem.v1'];
  const port = { getItem: key => { assert.ok(allowed.includes(key)); reads.push(key); return values.get(key) ?? null; }, setItem: () => assert.fail('Export wrote storage'), removeItem: () => assert.fail('Export removed storage') };
  return { port, values, reads };
}
function importIntoDaily(file) {
  const values = new Map();
  const port = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
  const state = createDailyState(port);
  const service = connectReading(state, { storage: port, sessionStorage: port, fetch: () => assert.fail('Migration called the API') });
  try { service.applyImport(service.previewImport(file)); return service.read(); }
  finally { service.stop(); }
}
async function exporter() { return (await import('../../../legacy/exporters/reader/export.js')).exportLegacyReader; }

test('legacy Reader export whitelists preferences and remembered metadata through Daily import without tokens or bodies', async () => {
  const exportLegacyReader = await exporter();
  for (const key of ['readerPicker.settings.v2', 'readerPicker.settings.v1']) {
    const legacy = storage({ [key]: { ...settings, token: 'fixture-private-token', rememberToken: true }, 'readerPicker.lastItem.v1': item });
    legacy.values.set('readerPicker.token.pwa.v1', 'fixture-private-token');
    legacy.values.set('readerPicker.cache.v2', 'fixture-private-cache');
    const before = [...legacy.values];
    const file = exportLegacyReader(legacy.port);
    for (const secret of ['fixture-private-token', 'fixture-private-cache', 'fixture-private-body']) assert.equal(file.includes(secret), false);
    const data = importIntoDaily(file);
    assert.deepEqual(data.settings, { ...DEFAULTS, ...settings });
    assert.equal(data.lastItem.id, item.id);
    assert.equal(data.lastItem.title, item.title);
    assert.equal(data.lastItem.reading_progress, 0.25);
    assert.deepEqual([...legacy.values], before);
  }
});

test('legacy Reader export initializes no keys and does not read an opted-out remembered item or obsolete settings', async () => {
  const exportLegacyReader = await exporter();
  const empty = storage();
  const fresh = JSON.parse(exportLegacyReader(empty.port));
  assert.deepEqual(fresh.settings, DEFAULTS);
  assert.equal(fresh.lastItem, null);
  assert.equal(empty.values.size, 0);
  const legacy = storage({ 'readerPicker.settings.v2': { ...settings, rememberLastItem: false } });
  legacy.values.set('readerPicker.lastItem.v1', '{broken');
  legacy.values.set('readerPicker.settings.v1', '{obsolete');
  const result = JSON.parse(exportLegacyReader(legacy.port));
  assert.equal(result.lastItem, null);
  assert.deepEqual(legacy.reads, ['readerPicker.settings.v2']);
});

test('legacy Reader invalid preferences remembered URLs JSON and blocked storage fail without deletion or fallback reset', async () => {
  const exportLegacyReader = await exporter();
  for (const overrides of [{ count: 0 }, { locations: 'new' }, { rememberLastItem: 'yes' }]) {
    const legacy = storage({ 'readerPicker.settings.v2': { ...settings, ...overrides }, 'readerPicker.settings.v1': settings });
    const before = [...legacy.values];
    assert.throws(() => exportLegacyReader(legacy.port), /invalid|unsupported/i);
    assert.deepEqual([...legacy.values], before);
  }
  const unsafe = storage({ 'readerPicker.settings.v2': settings, 'readerPicker.lastItem.v1': { ...item, url: 'https://example.com/unsafe' } });
  assert.throws(() => exportLegacyReader(unsafe.port), /invalid|remembered/i);
  unsafe.values.set('readerPicker.settings.v2', '{broken');
  assert.throws(() => exportLegacyReader(unsafe.port), SyntaxError);
  assert.throws(() => exportLegacyReader({ getItem: () => { throw new Error('Storage blocked'); } }), /blocked/);
});
