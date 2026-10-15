import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

async function worker(options = {}) {
  const source = await readFile(new URL(process.env.DAILY_WORKER_SOURCE || '../../apps/daily/src/sw.js', import.meta.url), 'utf8');
  const events = new Map();
  const removed = [];
  const cached = new Map();
  const cache = { addAll: async paths => { for (const path of paths) cached.set(path, new Response(path)); }, match: async key => cached.get(typeof key === 'string' ? key : new URL(key.url).pathname) };
  let activated = 0;
  const clients = (options.clients || [false]).map((blocked, index) => ({
    id: `client-${index}`,
    url: 'https://example.test/daily/',
    postMessage(message) {
      if (blocked === 'silent') return;
      queueMicrotask(() => events.get('message')({ data: { type: 'DAILY_UPDATE_STATE', id: message.id, blocked }, source: { id: `client-${index}` } }));
    },
  }));
  const self = { DAILY_ASSETS: ['/daily/', '/daily/index.html', '/daily/a.js'], DAILY_CACHE: 'daily-pwa-v2', DAILY_BASE: '/daily/', location: { origin: 'https://example.test' }, clients: { claim: async () => undefined, matchAll: async () => clients }, skipWaiting: async () => { activated++; }, addEventListener: (name, handler) => events.set(name, handler) };
  const caches = { open: async () => cache, keys: async () => ['plants-v1', 'daily-pwa-v1', 'daily-pwa-v2'], delete: async name => { removed.push(name); } };
  const fetch = async () => {
    if (options.online) return new Response('new version');
    throw new Error('offline');
  };
  vm.runInNewContext(source, { self, caches, fetch, URL, crypto, setTimeout: callback => setTimeout(callback, 20), clearTimeout });
  return { events, removed, cached, clients, activated: () => activated };
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
  const { events, activated, clients } = await worker();
  await lifecycle(events, 'install');
  assert.equal(activated(), 0);
  events.get('message')({ data: 'unrelated', waitUntil: () => undefined });
  assert.equal(activated(), 0);
  let pending;
  events.get('message')({ data: { type: 'ACTIVATE_DAILY_UPDATE' }, source: clients[0], waitUntil: value => { pending = value; } });
  await pending;
  assert.equal(activated(), 1);
});

async function requestUpdate(worker) {
  let pending;
  worker.events.get('message')({ data: { type: 'ACTIVATE_DAILY_UPDATE' }, source: worker.clients[0], waitUntil: value => { pending = value; } });
  await pending;
}

test('online navigation stays on the cached version until an update is accepted', async () => {
  const { events } = await worker({ online: true });
  await lifecycle(events, 'install');
  const request = { url: 'https://example.test/daily/', method: 'GET', mode: 'navigate', headers: new Headers() };
  let pending;
  events.get('fetch')({ request, respondWith: value => { pending = value; } });
  assert.equal(await (await pending).text(), '/daily/');
});

test('any blocked tab prevents update activation', async () => {
  const current = await worker({ clients: [false, true] });
  await requestUpdate(current);
  assert.equal(current.activated(), 0);
});

test('unresponsive tabs and malformed state replies keep updates waiting', async () => {
  for (const state of ['silent', undefined, 'false']) {
    const current = await worker({ clients: [false, state] });
    await requestUpdate(current);
    assert.equal(current.activated(), 0);
  }
});

test('every same-app tab must explicitly report safe before an update activates', async () => {
  const current = await worker({ clients: [false, false] });
  await requestUpdate(current);
  assert.equal(current.activated(), 1);
});

test('updates from unknown clients are ignored', async () => {
  const current = await worker();
  let pending;
  current.events.get('message')({ data: { type: 'ACTIVATE_DAILY_UPDATE' }, source: { id: 'outsider', url: 'https://example.test/other/' }, waitUntil: value => { pending = value; } });
  await pending;
  assert.equal(current.activated(), 0);
});
