import test from 'node:test';
import assert from 'node:assert/strict';
import { setupWingspan, startWingspan } from './wingspan-helpers.mjs';
import * as sessions from '../src/backend/features/sessions.js';

function entries(session) {
  const ids = ['birds', 'bonusCards', 'goals', 'eggs', 'cachedFood', 'tuckedCards'];
  return ids.map((category, index) => ({ playerId: session.participants[0].playerId, category, value: [2, 3, 4, 5, 2, 4][index] }));
}

test('Wingspan draft categories save together in one atomic storage commit', async t => {
  const { data, storage } = await setupWingspan(t);
  const started = startWingspan(data);
  const session = started.sessions[0];
  let writes = 0;
  const save = storage.setItem;
  storage.setItem = (key, value) => { if (key === 'daily:v1') writes += 1; save(key, value); };
  const result = sessions.updateWingspanScores(started, session.id, entries(session));
  assert.deepEqual(result.errors, []);
  assert.equal(writes, 1);
  assert.equal(sessions.getTotals(result.data.sessions[0])[session.participants[0].playerId], 20);
  assert.equal(result.data.sessions[0].startedAt, session.startedAt);
});

test('Wingspan invalid draft batches and storage failures preserve every saved category', async t => {
  const { data, storage, values } = await setupWingspan(t);
  const started = startWingspan(data);
  const session = started.sessions[0];
  const draft = entries(session);
  const before = [...values];
  const result = sessions.updateWingspanScores(started, session.id, [...draft, { ...draft[0], value: -1 }]);
  assert.ok(result.errors.length);
  assert.deepEqual([...values], before);
  storage.setItem = () => { throw new Error('QuotaExceededError'); };
  assert.throws(() => sessions.updateWingspanScores(started, session.id, draft), /QuotaExceeded/);
  assert.deepEqual([...values], before);
});

test('Wingspan fields share normal score arithmetic while preserving missing values', async () => {
  const { readWingspanEntries } = await import('../src/scoring/wingspan/bindings.js');
  const { evaluateScoreExpression } = await import('../src/frontend/app/evaluateScoreExpression.js');
  const expressions = ['2+3', '12/3', '5*2', '8-3', '9/2', '1+1'];
  const root = { querySelectorAll: () => expressions.map(value => ({ value, validity: { badInput: false }, dataset: { playerId: 'one', category: 'birds' } })) };
  assert.deepEqual(readWingspanEntries(root).map(entry => entry.value), expressions.map(value => evaluateScoreExpression(value).value));
  const blank = { querySelectorAll: () => [{ value: '', validity: { badInput: false }, dataset: { playerId: 'one', category: 'birds' } }] };
  assert.equal(readWingspanEntries(blank)[0].value, null);
});
