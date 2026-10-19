import { createMetadataCache, cacheConfigKey } from '../src/cache.js';
import { createReviewCache } from '../src/review/cache.js';
import { DEFAULTS } from '../src/config.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readerError, readerText } from '../src/ui/i18n.js';
import { createDailyState } from '../../../packages/data/src/daily-state.js';
import { connectReading } from '../src/service.js';

test('Reader Spanish authored failures and destructive confirmation retain specific meaning', () => {
  assert.equal(readerError('es', new Error('Invalid Reader response.')), 'La respuesta de Reader no es válida.');
  assert.equal(readerError('es', new Error('The latest review changed. Refresh before completing it.')), 'El último repaso cambió. Actualízalo antes de completarlo.');
  assert.equal(readerError('es', new Error('Review completion was not confirmed by Readwise.')), 'Readwise no confirmó que el repaso se haya completado.');
  assert.equal(readerError('es', new DOMException('full', 'QuotaExceededError')), readerText('es', 'storage'));
  assert.equal(readerError('es', new SyntaxError('Unexpected token')), 'El archivo no es JSON válido. No se ha reemplazado nada.');
  assert.match(readerText('es', 'clearConfirm'), /Eliminar.*token.*Reader/);
  assert.equal(readerError('en', new Error('Invalid Reader response.')), 'Invalid Reader response.');
  assert.equal(readerError('es', new Error('Unknown external detail 🌱')), 'Unknown external detail 🌱');
});

test('Reader rejects unrenderable pick timestamps before saving and keeps valid original timestamps', () => {
  const values = new Map();
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
  const service = connectReading(createDailyState(storage), { storage });
  const data = service.read();
  data.picks = { documents: [], selectedAt: 0, fetchedAt: 0, settingsKey: JSON.stringify(data.settings) };
  for (const key of ['selectedAt', 'fetchedAt']) {
    const invalid = { ...data, picks: { ...data.picks, [key]: 8640000000000001 } };
    assert.throws(() => service.save(invalid), /invalid/i);
    assert.equal(values.size, 0);
  }
  service.save(data);
  assert.equal(service.read().picks.fetchedAt, 0);
});

test('Reader discards unrenderable and future disposable cache timestamps without replacing saved records', () => {
  const config = { ...DEFAULTS, token: 'fixture-only' };
  for (const timestamp of [1e100, 2000, -1]) {
    const records = new Map([
      ['daily:readwise:reader-cache:v1', { version: 1, accountId: 'cache-account', key: cacheConfigKey(config), savedAt: timestamp, documents: [] }],
      ['daily:readwise:review-cache:v1', { version: 1, accountId: 'cache-account', fetchedAt: timestamp, value: { id: 'review', url: 'https://readwise.io/dailyreview', completed: false, highlights: [] } }],
    ]);
    const before = structuredClone(records);
    const cacheStorage = { getItem: key => JSON.stringify(records.get(key)) };
    const options = { cacheStorage, accountId: () => 'cache-account', now: () => 1000 };
    assert.equal(createMetadataCache(options).loadCache(config), null);
    assert.equal(createReviewCache(options).read().status, 'idle');
    assert.deepEqual(records, before);
  }
});
