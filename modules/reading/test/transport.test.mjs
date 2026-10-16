import test from 'node:test';
import assert from 'node:assert/strict';
import { reader, document, response } from './source.mjs';

test('Reader pagination requests only the remaining scan allowance', async () => {
  const limits = [];
  const api = await reader({ fetch: async url => {
    const limit = Number(new URL(url).searchParams.get('limit'));
    limits.push(limit);
    return response(Array.from({ length: limit }, (_, index) => document(`${limits.length}-${index}`)), `next-${limits.length}`);
  } });
  const result = await api.fetchLocation('new', { ...api.defaults, token: 'fixture-only', scanLimit: 101 });
  assert.equal(result.length, 101);
  assert.deepEqual(limits, [100, 1]);
  assert.equal(api.lastScan.scanned, 101);
});

test('Reader enforces a local twenty-request rolling limit without automatically retrying', async () => {
  let now = 1000;
  let calls = 0;
  const api = await reader({ now: () => now, fetch: async url => {
    calls++;
    const limit = Number(new URL(url).searchParams.get('limit'));
    return response(Array.from({ length: limit }, (_, index) => document(`${calls}-${index}`)), `cursor-${calls}`);
  } });
  const config = { ...api.defaults, token: 'fixture-only', scanLimit: 2000 };
  await api.fetchLocation('new', config);
  assert.equal(calls, 20);
  await assert.rejects(api.fetchLocation('later', { ...config, scanLimit: 100 }), error => error.retryAfterSeconds === 60);
  assert.equal(calls, 20);
  now += 60001;
  await api.fetchLocation('later', { ...config, scanLimit: 100 });
  assert.equal(calls, 21);
});

test('Reader throttling honors Retry-After and rejects retries until the cooldown expires', async () => {
  let now = 1000;
  let calls = 0;
  const api = await reader({ now: () => now, fetch: async () => {
    calls++;
    return calls === 1 ? { ok: false, status: 429, headers: new Headers({ 'Retry-After': '120' }) } : response([]);
  } });
  const config = { ...api.defaults, token: 'fixture-only' };
  await assert.rejects(api.fetchLocation('new', config), error => error.retryAfterSeconds === 120);
  now += 60000;
  await assert.rejects(api.fetchLocation('new', config), error => error.retryAfterSeconds === 60);
  assert.equal(calls, 1);
  now += 60001;
  assert.deepEqual(await api.fetchLocation('new', config), []);
});

test('Reader request deadlines still abort when the caller supplies its own signal', async () => {
  const api = await reader({ timeoutMs: 10, fetch: async (url, options) => new Promise((resolve, reject) => {
    options.signal.addEventListener('abort', () => reject(new Error('Request timed out')), { once: true });
  }) });
  const controller = new AbortController();
  const fallback = setTimeout(() => controller.abort(), 500);
  try { await assert.rejects(api.fetchLocation('new', { ...api.defaults, token: 'fixture-only', signal: controller.signal }), /time|abort/i); }
  finally { clearTimeout(fallback); }
  assert.equal(controller.signal.aborted, false);
});
