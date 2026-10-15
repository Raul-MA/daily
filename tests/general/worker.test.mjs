import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

async function worker() {
  const source = await readFile(new URL('../../apps/daily/src/sw.js', import.meta.url), 'utf8');
  const events = new Map();
  const removed = [];
  const cached = new Map();
  const cache = { addAll: async paths => { for (const path of paths) cached.set(path, new Response(path)); }, match: async key => cached.get(typeof key === 'string' ? key : new URL(key.url).pathname) };
  let activated = 0;
  const self = { DAILY_ASSETS: ['/daily/', '/daily/index.html', '/daily/a.js'], DAILY_CACHE: 'daily-pwa-v2', DAILY_BASE: '/daily/', location: { origin: 'https://example.test' }, clients: { claim: async () => undefined }, skipWaiting: async () => { activated++; }, addEventListener: (name, handler) => events.set(name, handler) };
  const caches = { open: async () => cache, keys: async () => ['plants-v1', 'daily-pwa-v1', 'daily-pwa-v2'], delete: async name => { removed.push(name); } };
  const fetch = async () => { throw new Error('offline'); };
  vm.runInNewContext(source, { self, caches, fetch, URL });
  return { events, removed, cached, activated: () => activated };
}

async function lifecycle(events, name) {
  let pending;
  events.get(name)({ waitUntil: value => { pending = value; } });
  await pending;
}

test('new worker installs owned assets and activation never deletes sibling caches', async () => {
  const { events, removed, cached } = await worker();
  await lifecycle(events, 'install');
  assert.equal(cached.size, 3);
  await lifecycle(events, 'activate');
  assert.deepEqual(removed, ['daily-pwa-v1']);
});

test('worker does not intercept authenticated external non-GET or unknown requests', async () => {
  const { events } = await worker();
  const inputs = [
    new Request('https://readwise.io/api/v3/list/'),
    new Request('https://example.test/daily/a.js', { headers: { Authorization: 'Token private' } }),
    new Request('https://example.test/daily/a.js', { method: 'POST' }),
    new Request('https://example.test/coffee-tracker/'),
    new Request('https://example.test/daily/not-prebuilt.json'),
  ];
  for (const request of inputs) {
    let intercepted = false;
    events.get('fetch')({ request, respondWith: () => { intercepted = true; } });
    assert.equal(intercepted, false);
  }
});

test('offline navigation and built assets use only this app cache', async () => {
  const { events } = await worker();
  await lifecycle(events, 'install');
  const request = { url: 'https://example.test/daily/', method: 'GET', mode: 'navigate', headers: new Headers() };
  let pending;
  events.get('fetch')({ request, respondWith: value => { pending = value; } });
  assert.equal(await (await pending).text(), '/daily/');
});

test('updates wait until explicitly requested and reject unrelated messages', async () => {
  const { events, activated } = await worker();
  await lifecycle(events, 'install');
  assert.equal(activated(), 0);
  events.get('message')({ data: 'unrelated', waitUntil: () => undefined });
  assert.equal(activated(), 0);
  let pending;
  events.get('message')({ data: { type: 'ACTIVATE_DAILY_UPDATE' }, waitUntil: value => { pending = value; } });
  await pending;
  assert.equal(activated(), 1);
});
