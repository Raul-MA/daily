'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

function assertAssets() {
  const manifest = JSON.parse(fs.readFileSync('dist/manifest.webmanifest'));
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.scope, '/daily/');
  for (const icon of manifest.icons) {
    const file = path.join('dist', icon.src.slice(manifest.scope.length));
    const data = fs.readFileSync(file);
    if (icon.type === 'image/svg+xml') {
      assert.equal(icon.sizes, 'any');
      assert.match(data.toString(), /viewBox="0 0 512 512"/);
    } else {
      const [width, height] = icon.sizes.split('x').map(Number);
      assert.equal(data.readUInt32BE(16), width);
      assert.equal(data.readUInt32BE(20), height);
    }
  }
  const assets = JSON.parse(fs.readFileSync('dist/asset-list.json'));
  for (const asset of assets) assert.ok(fs.existsSync(path.join('dist', asset)), asset);
  assert.ok(assets.includes('modules/whatsapp/src/app.js'));
  assert.ok(assets.includes('modules/whatsapp/src/style.css'));
  assert.equal(fs.existsSync('modules/whatsapp/src/sw.js'), false);
}
async function sharedWorker() {
  const handlers = {};
  const deleted = [];
  let shell;
  let claimed = false;
  let fetched = false;
  const scope = 'https://example.com/daily/';
  const cache = { addAll: async paths => { shell = paths; }, match: async request => ({ offline: true, url: new URL(request, scope).href }) };
  const self = { location: new URL(`${scope}sw.js`), clients: { claim: async () => { claimed = true; } }, addEventListener: (name, handler) => { handlers[name] = handler; } };
  vm.runInNewContext(fs.readFileSync('dist/sw.js', 'utf8'), {
    self, URL, caches: { open: async () => cache, keys: async () => ['daily-pwa-old', 'unrelated'], delete: async key => { deleted.push(key); } },
    fetch: async () => { fetched = true; throw new Error('Offline'); },
  });
  let pending;
  handlers.install({ waitUntil: promise => { pending = promise; } });
  await pending;
  for (const asset of shell) assert.ok(fs.existsSync(path.join('dist', asset.slice('/daily/'.length))), asset);
  handlers.activate({ waitUntil: promise => { pending = promise; } });
  await pending;
  assert.deepEqual(deleted, ['daily-pwa-old']);
  assert.ok(claimed);
  for (const asset of shell) {
    const url = new URL(asset, scope).href;
    handlers.fetch({ request: new Request(url), respondWith: promise => { pending = promise; } });
    assert.equal((await pending).url, url);
  }
  assert.equal(fetched, false);
  for (const url of ['https://wa.me/?text=hello', `${scope}unrelated.txt`]) {
    handlers.fetch({ request: new Request(url), respondWith: () => assert.fail('Worker intercepted an unrelated request') });
  }
}
async function mountNative(context, draft) {
  const { createDailyState } = await import('../../../../packages/data/src/daily-state.js');
  const { connectWhatsApp } = await import('../../src/service.js');
  const { bindComposer, initializeComposer } = await import('../../src/controller.js');
  const values = new Map();
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  for (const id of ['composer']) context.document.querySelector(`#${id}`).dataset = {};
  const service = connectWhatsApp(createDailyState(storage));
  service.saveDraft(draft, service.read());
  const options = { host: context.document, service, ui: {}, language: 'en', clipboard: context.navigator.clipboard, navigate: url => { context.window.location.href = url; }, changed: () => undefined, now: () => Date.now() };
  initializeComposer(options);
  bindComposer(options);
  return service;
}
module.exports = { assertAssets, sharedWorker, mountNative };
