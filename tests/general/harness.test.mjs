import test from 'node:test';
import assert from 'node:assert/strict';
import { loadModule, modulePath } from '../support/load-module.mjs';
import { appURL } from '../support/app-url.mjs';

test('missing modules fail when exercised rather than preventing test discovery', async () => {
  const module = await loadModule('plants', 'deliberately-absent.js');
  assert.throws(() => module.save(), /Unimplemented plants: deliberately-absent.js:save/);
});

test('new browser tests target the Pages path and module hash', () => {
  assert.equal(appURL('games', 'session'), '/daily/#/games/session');
  assert.match(modulePath('plants', 'store/store.js'), /modules\/plants\/src\/store\/store.js$/);
});
