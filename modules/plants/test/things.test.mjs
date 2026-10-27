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
test('direct URL carries the exact title, date, and project', () => {
    const plant = { name: 'Monstera', species: 'Monstera deliciosa', location: 'Casa', notes: 'Check soil 🌱' };
    const url = things.buildThingsTodoURL({ plant, type: 'watering', date: '2026-08-18', project: 'Plantas de casa', copy: { watering: 'Revisar riego', next: 'Próximo', thingsCheck: 'Comprueba la planta', species: 'Especie', location: 'Ubicación', notes: 'Notas' } });
    const parsed = new URL(url);
    assert.equal(parsed.protocol, 'things:');
    assert.equal(parsed.pathname, '/add');
    assert.equal(parsed.searchParams.get('title'), 'Revisar riego — Monstera');
    assert.equal(parsed.searchParams.get('when'), '2026-08-18');
    assert.equal(parsed.searchParams.get('list'), 'Plantas de casa');
    assert.equal(parsed.searchParams.get('reveal'), 'true');
    assert.match(parsed.searchParams.get('notes'), /Monstera deliciosa/);
    assert.match(parsed.searchParams.get('notes'), /Check soil 🌱/);
    assert.match(parsed.searchParams.get('notes'), /Comprueba la planta/);
    const defaults = { plant, type: 'watering', date: '2026-08-18', copy: { watering: 'Watering' } };
    assert.equal(new URL(things.buildThingsTodoURL(defaults)).searchParams.get('list'), 'Plantas');
    assert.equal(things.buildThingsTodoURL({ ...defaults, date: null }), null);
    const project = new URL(things.buildThingsProjectURL());
    assert.equal(project.pathname, '/add-project');
    assert.equal(project.searchParams.get('title'), 'Plantas');
    assert.equal(new URL(things.buildThingsProjectURL('Casa 🏡')).searchParams.get('title'), 'Casa 🏡');
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
