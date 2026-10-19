import { modulePath } from '../../../tests/support/load-module.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';
test('precache requests are unique and backed by repository assets', () => {
    if (!process.env.DAILY_SOURCE_ROOT) return sharedInventory();
    const source = readFileSync(modulePath('piano', 'sw.js'), 'utf8');
    const assets = vm.runInNewContext(`${source}\nSTATIC_ASSETS`, { self: { addEventListener() { } } });
    assert.equal(new Set(assets).size, assets.length, 'Cache.addAll rejects duplicate requests');
    for (const asset of assets) {
        assert.ok(asset.startsWith('/toniq/'), asset);
        assert.ok(existsSync(modulePath('piano', asset.slice('/toniq/'.length))), asset);
    }
});
function sharedInventory() {
    const self = { addEventListener() { } };
    vm.runInNewContext(readFileSync('dist/sw.js', 'utf8'), { self });
    const assets = self.DAILY_ASSETS;
    assert.equal(new Set(assets).size, assets.length, 'Cache.addAll rejects duplicate requests');
    for (const asset of assets) {
        assert.ok(asset.startsWith(self.DAILY_BASE), asset);
        const relative = asset.slice(self.DAILY_BASE.length) || 'index.html';
        assert.ok(existsSync(`dist/${relative}`), asset);
    }
    assert.ok(assets.some(asset => asset.endsWith('/modules/piano/src/js/app.js')));
    assert.ok(assets.some(asset => asset.endsWith('/modules/piano/src/assets/notes/c4.mp3')));
    assert.ok(!assets.some(asset => asset.endsWith('/modules/piano/src/sw.js')));
}
