import test from 'node:test';
import assert from 'node:assert/strict';
import { createDailyState } from '../../../packages/data/src/daily-state.js';
import { connectWhatsApp } from '../src/service.js';

const draft = { recipient: 'Café 👋', date: '2026-10-08', time: '09:00', message: '你好\nA&B + 100%' };
function storage(value) {
  const values = new Map();
  if (value !== undefined) values.set('whatsapp-later-draft', JSON.stringify(value));
  const reads = [];
  const port = { getItem: key => { assert.equal(key, 'whatsapp-later-draft'); reads.push(key); return values.get(key) ?? null; }, setItem: () => assert.fail('Export wrote storage'), removeItem: () => assert.fail('Export removed storage') };
  return { values, reads, port };
}
function importIntoDaily(file) {
  const values = new Map();
  const state = createDailyState({ getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) });
  const service = connectWhatsApp(state);
  service.applyImport(service.previewImport(file));
  return service.read().draft;
}
async function exporter() { return (await import('../../../legacy/exporters/whatsapp/export.js')).exportLegacyWhatsApp; }

test('legacy WhatsApp export imports expired and incomplete Unicode drafts without rescheduling or changing originals', async () => {
  const exportLegacyWhatsApp = await exporter();
  for (const value of [draft, { ...draft, recipient: '', message: '', date: '', time: '' }]) {
    const legacy = storage(value);
    legacy.values.set('unrelated-token', 'fixture-private-token');
    const before = [...legacy.values];
    const file = exportLegacyWhatsApp(legacy.port);
    assert.deepEqual(JSON.parse(file), { app: 'whatsapp-later', schemaVersion: 1, draft: value });
    assert.deepEqual(importIntoDaily(file), value);
    assert.equal(file.includes('fixture-private-token'), false);
    assert.deepEqual([...legacy.values], before);
    assert.deepEqual(legacy.reads, ['whatsapp-later-draft']);
  }
});

test('legacy WhatsApp empty or null saved drafts stay absent and unknown properties are excluded', async () => {
  const exportLegacyWhatsApp = await exporter();
  for (const value of [undefined, null]) {
    const legacy = storage(value);
    const before = [...legacy.values];
    assert.equal(JSON.parse(exportLegacyWhatsApp(legacy.port)).draft, null);
    assert.deepEqual([...legacy.values], before);
  }
  const legacy = storage({ ...draft, token: 'fixture-private-token', lastThingsUrl: 'fixture-private-handoff' });
  const file = exportLegacyWhatsApp(legacy.port);
  assert.deepEqual(JSON.parse(file).draft, draft);
  assert.equal(file.includes('fixture-private'), false);
});

test('legacy WhatsApp malformed JSON invalid dates clocks and missing fields fail without clearing original storage', async () => {
  const exportLegacyWhatsApp = await exporter();
  for (const value of [{ ...draft, date: '2026-02-30' }, { ...draft, time: '24:00' }, { recipient: '' }, [], false]) {
    const legacy = storage(value);
    const before = [...legacy.values];
    assert.throws(() => exportLegacyWhatsApp(legacy.port), /invalid|unsupported/i);
    assert.deepEqual([...legacy.values], before);
  }
  const broken = storage();
  broken.values.set('whatsapp-later-draft', '{broken');
  assert.throws(() => exportLegacyWhatsApp(broken.port), SyntaxError);
  assert.equal(broken.values.get('whatsapp-later-draft'), '{broken');
  assert.throws(() => exportLegacyWhatsApp({ getItem: () => { throw new Error('Storage blocked'); } }), /blocked/);
});
