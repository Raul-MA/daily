import test from 'node:test';
import assert from 'node:assert/strict';

const load = () => import('../../apps/daily/src/diagnostics/connections.js');

test('diagnostic rejects empty credentials without making requests', async () => {
  const { checkReadwise } = await load();
  let calls = 0;
  await assert.rejects(checkReadwise('  ', { fetch: async () => { calls++; } }), /token/i);
  assert.equal(calls, 0);
});

test('diagnostic checks only three GET endpoints sequentially without exposing content', async () => {
  const { checkReadwise } = await load();
  const requests = [];
  let active = 0;
  const result = await checkReadwise(' sample-secret ', {
    origin: 'https://raul-ma.github.io',
    fetch: async (url, options) => {
      assert.equal(++active, 1);
      requests.push({ url, options });
      await Promise.resolve();
      active--;
      const status = requests.length === 1 ? 204 : 200;
      return new Response(status === 204 ? null : 'private review content', { status });
    },
  });
  assert.deepEqual(requests.map(request => request.url), [
    'https://readwise.io/api/v2/auth/',
    'https://readwise.io/api/v3/list/?limit=1',
    'https://readwise.io/api/v2/review/',
  ]);
  for (const { options } of requests) {
    assert.equal(options.method, 'GET');
    assert.equal(options.headers.Authorization, 'Token sample-secret');
    assert.equal(options.credentials, 'omit');
    assert.equal(options.cache, 'no-store');
    assert.equal(options.redirect, 'error');
    assert.ok(options.signal instanceof AbortSignal);
  }
  assert.equal(result.targetOrigin, true);
  assert.deepEqual(result.checks.map(check => check.outcome), ['available', 'available', 'available']);
  assert.doesNotMatch(JSON.stringify(result), /sample-secret|private review content/);
});

test('review absence, unauthorized, throttling and server errors stay distinct', async () => {
  const { checkReadwise } = await load();
  for (const [status, expected] of [[404, 'no-review'], [401, 'unauthorized'], [403, 'unauthorized'], [429, 'rate-limited'], [503, 'unavailable'], [202, 'unexpected']]) {
    const result = await checkReadwise('fixture', { fetch: async () => new Response(null, { status }) });
    assert.equal(result.checks[2].outcome, expected);
    assert.equal(result.checks[2].status, status);
    if (status === 404) assert.equal(result.checks[0].outcome, 'unexpected');
  }
});

test('network failures stay isolated and raw errors never reach diagnostic results', async () => {
  const { checkReadwise } = await load();
  let calls = 0;
  const result = await checkReadwise('fixture', { fetch: async () => {
    if (++calls === 2) throw new Error('private credential fixture');
    return new Response(null, { status: 204 });
  } });
  assert.equal(calls, 3);
  assert.equal(result.checks[1].outcome, 'network-or-cors');
  assert.equal(result.checks[1].status, null);
  assert.doesNotMatch(JSON.stringify(result), /private credential/);
});

test('hung requests time out and remaining endpoint checks still execute', async () => {
  const { checkReadwise } = await load();
  const result = await checkReadwise('fixture', { timeoutMs: 5, fetch: (_, { signal }) => new Promise((_, reject) => {
    signal.addEventListener('abort', () => reject(new Error('timeout')), { once: true });
  }) });
  assert.deepEqual(result.checks.map(check => check.outcome), ['timeout', 'timeout', 'timeout']);
});

test('local diagnostics do not claim Pages-origin verification', async () => {
  const { checkReadwise } = await load();
  const result = await checkReadwise('fixture', {
    origin: 'http://127.0.0.1:8766', fetch: async () => new Response(null, { status: 200 }),
  });
  assert.equal(result.origin, 'http://127.0.0.1:8766');
  assert.equal(result.targetOrigin, false);
});
