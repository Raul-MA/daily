import assert from 'node:assert/strict';
import { loadModule } from '../../../tests/support/load-module.mjs';
import test from 'node:test';
const store = await loadModule('plants', 'store/store.js');
const KEY = 'plantTracker_plants';
function makePlant(overrides = {}) {
    return {
        id: 'plant-1',
        name: 'Monstera',
        dateAdded: '2026-01-01T00:00:00.000Z',
        schedule: {
            wateringIntervalDays: 7,
            soilIntervalMonths: 12,
            fertilizerIntervalWeeks: 4,
        },
        careLog: [],
        ...overrides,
    };
}
class MemoryStorage {
    constructor(entries = {}) {
        this.values = new Map(Object.entries(entries));
        this.primaryWrites = 0;
        this.failPrimaryWrites = false;
    }
    getItem(key) {
        return this.values.has(key) ? this.values.get(key) : null;
    }
    setItem(key, value) {
        if (key === KEY) {
            this.primaryWrites += 1;
            if (this.failPrimaryWrites)
                throw new Error('QuotaExceededError');
        }
        this.values.set(key, String(value));
    }
    removeItem(key) {
        this.values.delete(key);
    }
}
test('valid legacy data remains readable when its migration write fails', () => {
    const plant = makePlant();
    const storage = new MemoryStorage({ [KEY]: JSON.stringify([plant]) });
    storage.failPrimaryWrites = true;
    globalThis.localStorage = storage;
    assert.deepEqual(store.getPlants(), [plant]);
});
test('care log and next-due override are committed in one primary write', () => {
    const plant = makePlant({
        schedule: {
            wateringIntervalDays: 7,
            soilIntervalMonths: 12,
            fertilizerIntervalWeeks: 4,
            nextDueOverrides: { watering: '2026-07-30' },
        },
    });
    const storage = new MemoryStorage({ [KEY]: JSON.stringify([plant]) });
    globalThis.localStorage = storage;
    store.getPlants();
    storage.primaryWrites = 0;
    const events = [];
    globalThis.CustomEvent ??= class CustomEvent {
        constructor(type, init = {}) {
            this.type = type;
            this.detail = init.detail;
        }
    };
    globalThis.window = { dispatchEvent: event => events.push(event) };
    const entry = {
        id: 'log-1',
        type: 'skip',
        careType: 'watering',
        date: '2026-07-25T12:00:00.000Z',
        note: 'Revisar después',
    };
    store.addCareLogAndSetNextDue('plant-1', entry, 'watering', '2026-08-01');
    const [saved] = store.getPlants();
    assert.equal(storage.primaryWrites, 1);
    assert.equal(saved.schedule.nextDueOverrides.watering, '2026-08-01');
    assert.deepEqual(saved.careLog, [entry]);
    assert.equal(events.filter(event => event.type === 'stillgreen:data-saved').length, 1);
});
test('validation failures use the storage-error notification path', () => {
    globalThis.localStorage = new MemoryStorage();
    const events = [];
    globalThis.CustomEvent ??= class CustomEvent {
        constructor(type, init = {}) {
            this.type = type;
            this.detail = init.detail;
        }
    };
    globalThis.window = { dispatchEvent: event => events.push(event) };
    assert.throws(() => store.savePlants([makePlant({ name: 'x'.repeat(501) })]), /registro inválido/);
    assert.equal(events.at(-1)?.type, 'stillgreen:storage-error');
});
