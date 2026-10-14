import test from 'node:test';
import assert from 'node:assert/strict';

const load = () => import('../../packages/data/src/document-store.ts');
const key = 'daily-test';
const initial = () => ({ version: 1, items: [] });
const valid = value => value?.version === 1 && Array.isArray(value.items) && value.items.every(item => typeof item.id === 'string');
const record = id => ({ version: 1, items: [{ id }] });

class MemoryStorage {
  values = new Map();
  failKey;
  setItem(key, value) {
    if (key === this.failKey) throw new Error('QuotaExceededError');
    this.values.set(key, String(value));
  }
  getItem(key) { return this.values.get(key) ?? null; }
}

async function setup(entries = {}) {
  const { createDocumentStore } = await load();
  const storage = new MemoryStorage();
  for (const [name, value] of Object.entries(entries)) storage.setItem(name, value);
  return { storage, store: createDocumentStore({ storage, key, validate: valid, initial }) };
}

test('empty storage loads a fresh value without writing and saved documents round-trip', async () => {
  const { store, storage } = await setup();
  assert.deepEqual(store.load(), { value: initial(), status: 'initial' });
  assert.equal(storage.values.size, 0);
  store.save(record('plant-1'));
  assert.deepEqual(store.load(), { value: record('plant-1'), status: 'saved' });
  const snapshot = store.load();
  snapshot.value.items.push({ id: 'uncommitted' });
  assert.deepEqual(store.load().value, record('plant-1'));
});

test('replacement keeps the previous validated document as recovery', async () => {
  const { store, storage } = await setup({ [key]: JSON.stringify(record('old')) });
  store.save(record('new'));
  assert.deepEqual(JSON.parse(storage.getItem(`${key}:recovery`)), record('old'));
  assert.deepEqual(store.load().value, record('new'));
});

test('invalid and future documents are rejected without any storage mutation', async () => {
  const { store, storage } = await setup({ [key]: JSON.stringify(record('old')) });
  const before = [...storage.values];
  for (const invalid of [{ version: 2, items: [] }, { version: 1, items: [{}] }, null]) {
    assert.throws(() => store.save(invalid), /invalid|unsupported/i);
    assert.deepEqual([...storage.values], before);
  }
});

test('primary quota failure retains the readable document and reports failure', async () => {
  const { store, storage } = await setup({ [key]: JSON.stringify(record('old')) });
  storage.failKey = key;
  assert.throws(() => store.save(record('new')), /QuotaExceededError/);
  assert.deepEqual(store.load().value, record('old'));
});

test('recovery quota failure prevents a primary replacement', async () => {
  const { store, storage } = await setup({ [key]: JSON.stringify(record('old')) });
  storage.failKey = `${key}:recovery`;
  assert.throws(() => store.save(record('new')), /QuotaExceededError/);
  assert.deepEqual(store.load().value, record('old'));
});

test('corrupt primary data is preserved and recovery is explicit', async () => {
  const { store, storage } = await setup({ [key]: '{broken', [`${key}:recovery`]: JSON.stringify(record('recover')) });
  assert.deepEqual(store.load(), { value: record('recover'), status: 'recovered' });
  assert.equal(storage.getItem(`${key}:corrupt`), '{broken');
  assert.equal(storage.getItem(key), '{broken');
  store.save(record('confirmed-replacement'));
  assert.deepEqual(store.load().value, record('confirmed-replacement'));
  assert.deepEqual(JSON.parse(storage.getItem(`${key}:recovery`)), record('recover'));
});

test('unrecoverable corruption never produces an empty collection', async () => {
  const { store, storage } = await setup({ [key]: '{broken', [`${key}:recovery`]: '{also broken' });
  assert.throws(() => store.load(), /recover|invalid/i);
  assert.equal(storage.getItem(key), '{broken');
});

test('missing primary data can recover from an existing valid recovery document', async () => {
  const { store } = await setup({ [`${key}:recovery`]: JSON.stringify(record('recover')) });
  assert.deepEqual(store.load(), { value: record('recover'), status: 'recovered' });
});

test('storage preserves Unicode and a synthetic document larger than reported backups', async () => {
  const { store, storage } = await setup();
  const document = { version: 1, items: Array.from({ length: 350 }, (_, id) => ({ id: `record-${id}`, name: 'Café 🌱 漢字'.repeat(50) })) };
  store.save(document);
  assert.ok(new TextEncoder().encode(storage.getItem(key)).byteLength > 140000);
  assert.deepEqual(store.load().value, document);
});

test('lossy serialization is validated before touching existing records', async () => {
  const { store, storage } = await setup({ [key]: JSON.stringify(record('old')) });
  const before = [...storage.values];
  const value = { ...record('new'), toJSON: () => ({ version: 99, items: [] }) };
  assert.throws(() => store.save(value), /invalid|unsupported/i);
  assert.deepEqual([...storage.values], before);
});

test('a future primary schema is rejected without recovery or mutation', async () => {
  const { store, storage } = await setup({ [key]: '{"version":2,"items":[]}', [`${key}:recovery`]: JSON.stringify(record('older')) });
  const before = [...storage.values];
  assert.throws(() => store.load(), /unsupported/i);
  assert.deepEqual([...storage.values], before);
});

test('failure to preserve corrupt data reports failure without replacing it', async () => {
  const { store, storage } = await setup({ [key]: '{broken', [`${key}:recovery`]: JSON.stringify(record('recover')) });
  storage.failKey = `${key}:corrupt`;
  assert.throws(() => store.load(), /QuotaExceededError/);
  assert.equal(storage.getItem(key), '{broken');
});
