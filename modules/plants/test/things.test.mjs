import assert from 'node:assert/strict';
import { loadModule } from '../../../tests/support/load-module.mjs';
import test from 'node:test';
const things = await loadModule('plants', 'integrations/things.js');
class MemoryStorage {
    constructor() { this.values = new Map(); }
    getItem(key) { return this.values.get(key) ?? null; }
    setItem(key, value) { this.values.set(key, String(value)); }
}
test('builds a stable watering title', () => {
    assert.equal(things.wateringReminderTitle(' Monstera '), 'Revisar riego — Monstera');
});
test('shortcut URL carries the exact title, date, and project', () => {
    const url = things.buildThingsShortcutURL({
        title: 'Revisar riego — Monstera',
        date: '2026-08-18',
        project: 'Plantas de casa',
    });
    const parsed = new URL(url);
    assert.equal(parsed.protocol, 'shortcuts:');
    assert.equal(parsed.searchParams.get('name'), things.THINGS_SHORTCUT_NAME);
    assert.equal(parsed.searchParams.get('input'), 'text');
    assert.deepEqual(JSON.parse(parsed.searchParams.get('text')), {
        version: 1,
        title: 'Revisar riego — Monstera',
        date: '2026-08-18',
        project: 'Plantas de casa',
    });
});
test('enabled integration requires a project', () => {
    globalThis.localStorage = new MemoryStorage();
    assert.throws(() => things.saveThingsSettings({ enabled: true, project: '  ' }), /nombre del proyecto/);
});
test('settings round-trip and normalize project whitespace', () => {
    globalThis.localStorage = new MemoryStorage();
    things.saveThingsSettings({ enabled: true, project: '  Plantas  ' });
    assert.deepEqual(things.getThingsSettings(), { enabled: true, project: 'Plantas' });
});
