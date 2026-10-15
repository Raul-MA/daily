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
  if (request.mode === 'navigate') {
    try {
      return await fetch(request);
    } catch {
      const stored = await cache.match(new URL(request.url).pathname, { ignoreVary: true });
      return stored || cache.match(`${base}index.html`, { ignoreVary: true });
    }
  }
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

self.addEventListener('message', event => {
  if (event.data?.type === 'ACTIVATE_DAILY_UPDATE') event.waitUntil(self.skipWaiting());
});
