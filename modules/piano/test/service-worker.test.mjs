import { modulePath } from '../../../tests/support/load-module.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';
test('precache requests are unique and backed by repository assets', () => {
    const source = readFileSync(modulePath('piano', 'sw.js'), 'utf8');
    const assets = vm.runInNewContext(`${source}\nSTATIC_ASSETS`, { self: { addEventListener() { } } });
    assert.equal(new Set(assets).size, assets.length, 'Cache.addAll rejects duplicate requests');
    for (const asset of assets) {
        assert.ok(asset.startsWith('/toniq/'), asset);
        assert.ok(existsSync(modulePath('piano', asset.slice('/toniq/'.length))), asset);
    }
});
