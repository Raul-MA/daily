import test from 'node:test';
import assert from 'node:assert/strict';
import { reader, document, response } from './source.mjs';

test('Reader paginates locations sequentially using cursor and token headers and excludes children', async () => {
  const calls = [];
  const api = await reader({ fetch: async (url, options) => {
    calls.push({ url: new URL(url), options });
    return calls.length === 1 ? response([document('a'), document('child', { parent_id: 'a' })], 'next-page') : response([document('b')]);
  } });
  const result = await api.fetchLocation('later', { ...api.defaults, token: 'fixture-only' });
  assert.deepEqual(result.map(item => item.id), ['a', 'b']);
  assert.equal(calls.length, 2);
  assert.equal(calls[0].url.origin, 'https://readwise.io');
  assert.equal(calls[0].url.searchParams.get('location'), 'later');
  assert.equal(calls[0].url.searchParams.get('limit'), '100');
  assert.equal(calls[1].url.searchParams.get('pageCursor'), 'next-page');
  assert.equal(calls[0].options.headers.Authorization, 'Token fixture-only');
});

test('Reader scan cap bounds returned documents and stops requesting further pages', async () => {
  let calls = 0;
  const api = await reader({ fetch: async () => { calls++; return response(Array.from({ length: 100 }, (_, index) => document(String(index))), 'more'); } });
  assert.equal((await api.fetchLocation('new', { ...api.defaults, scanLimit: 100, token: 'fixture-only' })).length, 100);
  assert.equal(calls, 1);
});

test('Reader authorization throttling and service errors reject without successful results', async () => {
  for (const status of [401, 429, 500]) {
    const api = await reader({ fetch: async () => ({ ok: false, status }) });
    await assert.rejects(api.fetchLocation('new', { ...api.defaults, token: 'fixture-only' }), /invalid|rate limit|failed/i);
  }
});

test('Reader session cache contains minimized metadata and invalidates changed scan configuration', async () => {
  const api = await reader();
  const config = { ...api.defaults, token: 'fixture-only' };
  api.saveCache(config, [document('a', { html_content: 'private content' })]);
  assert.equal(api.loadCache(config).length, 1);
  assert.equal(Object.hasOwn(api.loadCache(config)[0], 'html_content'), false);
  assert.equal(api.loadCache({ ...config, scanLimit: 100 }), null);
});
