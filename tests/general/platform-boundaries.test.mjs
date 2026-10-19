import test from 'node:test';
import assert from 'node:assert/strict';
import { validateActivities, validDuration } from '../../packages/platform/src/activity-types.js';
import { createDailyState } from '../../packages/data/src/daily-state.js';
import { createActivities } from '../../packages/platform/src/activities.js';

test('activity schemas reject unrenderable finite clocks and durations before creating the root', () => {
  const input = { id: 'countdown', kind: 'countdown', reference: 'countdown', label: 'Tea 🌱', durationMs: 60000 };
  const record = { ...input, status: 'running', elapsedMs: 0, startedAt: 1000, resumedAt: 1000, updatedAt: 1000 };
  for (const key of ['elapsedMs', 'startedAt', 'resumedAt', 'updatedAt']) {
    assert.equal(validateActivities([{ ...record, [key]: 8640000000000001 }]), false, key);
  }
  assert.equal(validDuration(1e100), false);
  const values = new Map();
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  const activities = createActivities(createDailyState(storage), () => 1e100);
  assert.throws(() => activities.start(input), /invalid/i);
  assert.equal(values.size, 0);
});

test('durable storage is requested where available and refusal or failure never claims retention', async () => {
  const { requestPersistence } = await import('../../packages/platform/src/persistence.js');
  let calls = 0;
  const manager = { persist: async function () { assert.equal(this, manager); calls++; return true; } };
  assert.equal(await requestPersistence(manager), true);
  assert.equal(calls, 1);
  assert.equal(await requestPersistence(undefined), false);
  assert.equal(await requestPersistence({}), false);
  assert.equal(await requestPersistence({ persist: async () => false }), false);
  assert.equal(await requestPersistence({ persist: async () => { throw new Error('Storage blocked'); } }), false);
});
