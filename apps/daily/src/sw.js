const assets = self.DAILY_ASSETS;
const cacheName = self.DAILY_CACHE;
const base = self.DAILY_BASE;

self.addEventListener('install', event => {
  event.waitUntil(caches.open(cacheName).then(cache => cache.addAll(assets)));
});

self.addEventListener('activate', event => {
  event.waitUntil(activate());
});

async function activate() {
  const names = await caches.keys();
  await Promise.all(names.filter(name => name.startsWith('daily-pwa-') && name !== cacheName).map(name => caches.delete(name)));
  await self.clients.claim();
}

async function respond(request) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(new URL(request.url).pathname, { ignoreVary: true });
  return cached || fetch(request);
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || request.headers.has('Authorization')) return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.search || !assets.includes(url.pathname)) return;
  event.respondWith(respond(request));
});

const updateChecks = new Map();

function ownedClient(client) {
  const url = new URL(client.url);
  return url.origin === self.location.origin && url.pathname.startsWith(base);
}

async function requestUpdate(source) {
  const clients = (await self.clients.matchAll({ type: 'window', includeUncontrolled: true })).filter(ownedClient);
  if (!source || !clients.some(client => client.id === source.id)) return;
  const allowed = await askClients(clients);
  if (allowed) await self.skipWaiting();
  else source.postMessage({ type: 'DAILY_UPDATE_RESULT', allowed: false });
}

function askClients(clients) {
  return new Promise(resolve => {
    const id = crypto.randomUUID();
    const timeout = setTimeout(() => finishCheck(id, false), 5000);
    updateChecks.set(id, { remaining: new Set(clients.map(client => client.id)), blocked: false, resolve, timeout });
    for (const client of clients) client.postMessage({ type: 'DAILY_UPDATE_CHECK', id });
  });
}

function finishCheck(id, allowed) {
  const pending = updateChecks.get(id);
  if (!pending) return;
  clearTimeout(pending.timeout);
  updateChecks.delete(id);
  pending.resolve(allowed);
}

function receiveState(event) {
  const pending = updateChecks.get(event.data.id);
  if (!pending || !event.source || !pending.remaining.has(event.source.id)) return;
  pending.remaining.delete(event.source.id);
  if (event.data.blocked !== false) pending.blocked = true;
  if (!pending.remaining.size) finishCheck(event.data.id, !pending.blocked);
}

self.addEventListener('message', event => {
  if (event.data?.type === 'ACTIVATE_DAILY_UPDATE') event.waitUntil(requestUpdate(event.source));
  if (event.data?.type === 'DAILY_UPDATE_STATE') receiveState(event);
});
