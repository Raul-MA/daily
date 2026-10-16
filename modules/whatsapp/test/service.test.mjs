import test from 'node:test';
import assert from 'node:assert/strict';
import { createDailyState } from '../../../packages/data/src/daily-state.js';

const draft = { recipient: 'Café 👋', date: '2026-10-08', time: '09:00', message: '你好\nA&B + 100%' };
async function setup() {
  const { connectWhatsApp } = await import('../src/service.js');
  const values = new Map();
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
  const state = createDailyState(storage);
  const service = connectWhatsApp(state);
  return { service, storage, state, values };
}

test('WhatsApp startup is read-only and drafts preserve Unicode expired times and unrelated modules', async () => {
  const { service, state, values } = await setup();
  assert.equal(service.read().draft, null);
  assert.equal(values.size, 0);
  state.commit(root => ({ ...root, modules: { coffee: { version: 1, data: { fixture: true } } }, preferences: { ...root.preferences, language: 'es' } }));
  service.saveDraft(draft, service.read());
  assert.deepEqual(service.read().draft, draft);
  assert.deepEqual(state.read().value.modules.coffee.data, { fixture: true });
  assert.equal(state.read().value.preferences.language, 'es');
});

test('WhatsApp saves incomplete drafts but rejects malformed future modules and stale edits without mutation', async () => {
  const { service, state } = await setup();
  const before = service.read();
  service.saveDraft({ ...draft, recipient: '', message: '' }, before);
  assert.throws(() => service.saveDraft(draft, before), /changed|conflict/i);
  const saved = state.read().value;
  assert.throws(() => service.saveDraft({ ...draft, date: '2026-02-30' }, service.read()), /invalid/i);
  assert.deepEqual(state.read().value, saved);
  state.commit(root => ({ ...root, modules: { ...root.modules, whatsapp: { version: 99, data: {} } } }));
  assert.throws(() => service.read(), /version/i);
});

test('WhatsApp failed draft saves and clears preserve the previous primary document', async () => {
  const { service, state, storage } = await setup();
  service.saveDraft(draft, service.read());
  const before = state.read().value;
  storage.setItem = () => { throw new Error('QuotaExceededError'); };
  assert.throws(() => service.saveDraft({ ...draft, message: 'Changed' }, service.read()), /QuotaExceeded/);
  assert.throws(() => service.clearDraft(service.read()), /QuotaExceeded/);
  assert.deepEqual(state.read().value, before);
});

test('WhatsApp legacy and native imports preview without writes and preserve expired local reminder times', async () => {
  const { service, values } = await setup();
  const preview = service.previewImport(JSON.stringify({ app: 'whatsapp-later', schemaVersion: 1, draft }));
  assert.equal(values.size, 0);
  assert.equal(preview.counts.drafts, 1);
  service.applyImport(preview);
  assert.deepEqual(service.read().draft, draft);
  const native = JSON.parse(service.exportBackup());
  assert.equal(native.app, 'daily-whatsapp');
  assert.equal(native.schemaVersion, 1);
  assert.deepEqual(native.data.draft, draft);
});

test('WhatsApp restore rejects changed stale invalid and future previews before replacing records', async () => {
  const { service, state } = await setup();
  const text = JSON.stringify({ app: 'daily-whatsapp', schemaVersion: 1, data: { draft } });
  const changed = service.previewImport(text);
  changed.data.draft.message = 'Tampered';
  assert.throws(() => service.applyImport(changed), /changed|tamper/i);
  const stale = service.previewImport(text);
  state.updatePreferences({ language: 'es' });
  assert.throws(() => service.applyImport(stale), /changed|conflict/i);
  assert.throws(() => service.previewImport(text.replace('"schemaVersion":1', '"schemaVersion":9')), /version/i);
  assert.throws(() => service.previewImport(JSON.stringify({ app: 'daily-whatsapp', schemaVersion: 1, data: { draft: { ...draft, time: '25:00' } } })), /invalid/i);
  assert.equal(service.read().draft, null);
});

test('WhatsApp replacement keeps other apps and recovery while failed imports retain the current draft', async () => {
  const { service, state, storage } = await setup();
  service.saveDraft(draft, service.read());
  state.commit(root => ({ ...root, modules: { ...root.modules, reading: { version: 1, data: { fixture: true } } } }));
  const recovery = service.exportRecovery();
  const preview = service.previewImport(JSON.stringify({ app: 'daily-whatsapp', schemaVersion: 1, data: { draft: null } }));
  const set = storage.setItem;
  storage.setItem = () => { throw new Error('QuotaExceededError'); };
  assert.throws(() => service.applyImport(preview), /QuotaExceeded/);
  assert.deepEqual(service.read().draft, draft);
  storage.setItem = set;
  service.applyImport(preview);
  assert.equal(service.read().draft, null);
  assert.deepEqual(state.read().value.modules.reading.data, { fixture: true });
  assert.deepEqual(JSON.parse(recovery).modules.whatsapp.data.draft, draft);
});
