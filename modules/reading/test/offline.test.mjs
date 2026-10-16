import test from 'node:test';
import assert from 'node:assert/strict';
import { reader, document } from './source.mjs';

function storage() {
  const values = new Map();
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key), dump: () => [...values.values()].join('') };
}

test('Reader disposable metadata cache survives a new instance but never crosses account identities', async () => {
  const cacheStorage = storage();
  let accountId = 'account-a';
  const options = { cacheStorage, accountId: () => accountId };
  const first = await reader(options);
  const config = { ...first.defaults, token: 'fixture-private-a' };
  first.saveCache(config, [document('a', { html_content: 'secret content' })]);
  const second = await reader(options);
  assert.equal(second.loadCache(config)[0].id, 'a');
  assert.equal(cacheStorage.dump().includes('fixture-private'), false);
  assert.equal(cacheStorage.dump().includes('secret content'), false);
  accountId = 'account-b';
  assert.equal(second.loadCache({ ...config, token: 'fixture-private-b' }), null);
});

test('scheduled-review cache is separate from backups and reopens as cached data until a successful refresh', async () => {
  const { createReviewService } = await import('../src/review/service.js');
  const cacheStorage = storage();
  const options = { cacheStorage, accountId: () => 'account-a', token: () => 'fixture-private', now: () => 1000 };
  const value = { review_id: 7, review_url: 'https://readwise.io/reviews/7', review_completed: false, highlights: [{ id: 9, text: 'A highlight.' }] };
  const first = createReviewService({ ...options, fetch: async () => ({ ok: true, status: 200, json: async () => value }) });
  await first.refresh();
  const second = createReviewService({ ...options, fetch: async () => { throw new TypeError('Failed to fetch'); } });
  assert.equal(second.snapshot().value.id, '7');
  assert.equal(second.snapshot().cached, true);
  await assert.rejects(second.refresh(), /fetch/i);
  assert.equal(second.snapshot().value.id, '7');
  assert.equal(cacheStorage.dump().includes('fixture-private'), false);
  second.clear();
  assert.equal(cacheStorage.dump(), '');
});

test('Reader scan summary preserves truncation across locations and a fresh cached pool retains its fetch timestamp', async () => {
  let now = 1000;
  let calls = 0;
  const api = await reader({ now: () => now, fetch: async url => {
    calls++;
    const location = new URL(url).searchParams.get('location');
    const results = location === 'new' ? Array.from({ length: 100 }, (_, index) => document(String(index))) : [document(location, { location })];
    return { ok: true, status: 200, json: async () => ({ results, nextPageCursor: location === 'new' ? 'more' : null }) };
  } });
  const config = { ...api.defaults, token: 'fixture-only', scanLimit: 100 };
  await api.getDocuments(config);
  assert.equal(api.scanSummary.truncated, true);
  assert.equal(api.scanSummary.scanned, 102);
  assert.equal(api.scanSummary.fetchedAt, 1000);
  now += 60000;
  await api.getDocuments(config);
  assert.equal(calls, 3);
  assert.equal(api.scanSummary.fetchedAt, 1000);
  assert.equal(api.scanSummary.truncated, true);
});
