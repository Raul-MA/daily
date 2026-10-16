import test from 'node:test';
import assert from 'node:assert/strict';
import { reader, document, response } from './source.mjs';

test('Reader custom counts support two through twenty and uniform sampling can choose unread before started', async () => {
  const api = await reader({ random: () => 0.999 });
  assert.equal(api.normalizeCount('2', 3), 2);
  assert.equal(api.normalizeCount('20', 3), 20);
  assert.equal(api.normalizeCount('21', 3), 3);
  const documents = [document('unread'), document('started', { reading_progress: 0.5 })];
  const config = { ...api.defaults, count: 1, policy: 'uniform' };
  assert.equal(api.choosePicks(documents, config)[0].id, 'unread');
  assert.equal(api.choosePicks(documents, { ...config, policy: 'started-first' })[0].id, 'started');
});

test('Reader finite budgets exclude unknown duration unless enabled and always reject archived completed and child records', async () => {
  const api = await reader();
  const documents = [document('unknown', { reading_time: null, word_count: 0 }), document('archive', { location: 'archive' }), document('child', { parent_id: 'parent' }), document('done', { reading_progress: 1 })];
  const config = { ...api.defaults, minutes: 10 };
  assert.deepEqual(api.filterDocuments(documents, config), []);
  assert.equal(api.getRemainingMinutes(documents[0]), null);
  assert.deepEqual(api.filterDocuments(documents, { ...config, includeUnknown: true }).map(item => item.id), ['unknown']);
  assert.deepEqual(api.filterDocuments(documents, { ...config, minutes: 0 }).map(item => item.id), ['unknown']);
});

test('Reader scan limits count fetched child records and expose truncation instead of scanning forever', async () => {
  let calls = 0;
  const api = await reader({ fetch: async () => {
    calls++;
    if (calls > 1) throw new Error('Scan exceeded its cap');
    return response(Array.from({ length: 100 }, (_, index) => document(String(index), { parent_id: 'parent' })), 'more');
  } });
  const documents = await api.fetchLocation('new', { ...api.defaults, scanLimit: 100, token: 'fixture-only' });
  assert.deepEqual(documents, []);
  assert.equal(calls, 1);
  assert.equal(api.lastScan.truncated, true);
  assert.equal(api.lastScan.scanned, 100);
});

test('Reader repeating cursors and malformed response shapes fail rather than return misleading complete data', async () => {
  let calls = 0;
  const api = await reader({ fetch: async () => { calls++; return response([document(String(calls))], 'repeat'); } });
  await assert.rejects(api.fetchLocation('new', { ...api.defaults, token: 'fixture-only' }), /cursor/i);
  assert.equal(calls, 2);
  const malformed = await reader({ fetch: async () => ({ ok: true, json: async () => ({ results: {} }) }) });
  await assert.rejects(malformed.fetchLocation('new', { ...malformed.defaults, token: 'fixture-only' }), /response|invalid/i);
});

test('Reader caches are account-specific without serializing tokens or full document content', async () => {
  const api = await reader();
  const first = { ...api.defaults, token: 'fixture-account-a' };
  const second = { ...first, token: 'fixture-account-b' };
  api.saveCache(first, [document('private', { html_content: 'secret content' })]);
  assert.equal(api.loadCache(first).length, 1);
  assert.equal(api.loadCache(second), null);
  assert.equal(JSON.stringify(api.cacheSnapshot()).includes('fixture-account'), false);
  assert.equal(JSON.stringify(api.cacheSnapshot()).includes('secret content'), false);
});

test('Reader links reject embedded credentials and cache freshness expires using the configured clock', async () => {
  let now = 1000;
  const api = await reader({ now: () => now });
  assert.equal(api.validateReaderUrl('https://user:password@readwise.io/read/a'), '');
  const config = { ...api.defaults, cacheMinutes: 1, token: 'fixture-only' };
  api.saveCache(config, [document('a')]);
  now += 61000;
  assert.equal(api.loadCache(config), null);
});
