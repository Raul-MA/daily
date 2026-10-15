import test from 'node:test';
import assert from 'node:assert/strict';

const load = () => import('../../packages/platform/src/update-gate.js');

test('update activation is held for any unfinished activity or unsaved form', async () => {
  const { updateAllowed } = await load();
  for (const status of ['running', 'paused']) assert.equal(updateAllowed({ dirty: false, activities: [{ status }] }), false);
  assert.equal(updateAllowed({ dirty: true, activities: [] }), false);
  assert.equal(updateAllowed({ dirty: false, activities: [{ status: 'completed' }] }), true);
  assert.equal(updateAllowed({ dirty: false, activities: [] }), true);
});
