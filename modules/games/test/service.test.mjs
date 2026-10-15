import test from 'node:test';
import assert from 'node:assert/strict';
import { createDailyState } from '../../../packages/data/src/daily-state.js';
import { createActivities, activityTime } from '../../../packages/platform/src/activities.js';
import { createPlayer } from '../src/backend/features/players.js';
import { createGame } from '../src/backend/features/games.js';
import * as sessions from '../src/backend/features/sessions.js';
import { loadData } from '../src/backend/core/storage.js';
import { updateSettings } from '../src/backend/features/settings.js';

async function setup(t) {
  const { connectGames } = await import('../src/service.js');
  const values = new Map();
  const writes = [];
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => { writes.push(key); values.set(key, value); } };
  const state = createDailyState(storage);
  const service = connectGames(state);
  t.after(service.stop);
  return { service, state, values, writes, storage };
}
function prepared() {
  let data = createPlayer(loadData(), { name: 'Ada 🌱' }).data;
  data = createPlayer(data, { name: 'Grace' }).data;
  return createGame(data, { name: 'Azul', scoringMode: 'highest_score_after_rounds', roundCount: 3 }).data;
}
function start(data) { return sessions.startSession(data, { gameId: data.games[0].id, playerIds: data.players.map(player => player.id) }); }

test('games read without writes and preserve other modules while sharing explicit language changes', async t => {
  const { state, values } = await setup(t);
  assert.equal(loadData().players.length, 0);
  assert.equal(values.size, 0);
  state.commit(current => ({ ...current, modules: { coffee: { version: 1, data: ['Keep'] } } }));
  updateSettings(prepared(), { language: 'es', theme: 'dark' });
  const root = state.read().value;
  assert.deepEqual(root.modules.coffee.data, ['Keep']);
  assert.equal(root.preferences.language, 'es');
  assert.equal(root.modules.games.data.settings.language, 'es');
  state.updatePreferences({ language: 'en' });
  assert.equal(loadData().settings.language, 'en');
  assert.ok([...values.keys()].every(key => key.startsWith('daily:v1')));
});

test('starting a game atomically registers its timestamp activity and retains unrelated countdowns', async t => {
  const { state, writes } = await setup(t);
  createActivities(state).start({ id: 'tea', kind: 'countdown', reference: 'tea', label: 'Tea', durationMs: 60000 });
  const data = prepared();
  writes.length = 0;
  const result = start(data);
  assert.deepEqual(result.errors, []);
  assert.equal(writes.filter(key => key === 'daily:v1').length, 1);
  const session = result.data.sessions[0];
  const running = createActivities(state).list().find(activity => activity.kind === 'game');
  assert.equal(running.reference, session.id);
  assert.equal(running.startedAt, Date.parse(session.startedAt));
  assert.equal(activityTime(running, running.startedAt + 90000).elapsedMs, 90000);
  assert.equal(createActivities(state).list().find(activity => activity.id === 'tea').status, 'running');
  const before = writes.length;
  assert.equal(loadData().sessions[0].id, session.id);
  assert.equal(writes.length, before);
});

test('scores never restart game timing and finishing atomically completes the shared activity', async t => {
  const { state, writes } = await setup(t);
  let data = start(prepared()).data;
  const session = data.sessions[0];
  const original = createActivities(state).list()[0];
  data = sessions.updateScore(data, { sessionId: session.id, roundId: session.rounds[0].id, playerId: data.players[0].id }, 9).data;
  assert.equal(createActivities(state).list()[0].startedAt, original.startedAt);
  writes.length = 0;
  const result = sessions.finishSessionWithTiming(data, session.id, { startedAt: '2026-01-01T12:00:00Z', completedAt: '2026-01-01T12:20:00Z', durationMinutesOverride: 12 });
  assert.deepEqual(result.errors, []);
  assert.equal(writes.filter(key => key === 'daily:v1').length, 1);
  const activity = createActivities(state).list()[0];
  assert.equal(activity.status, 'completed');
  assert.equal(activity.elapsedMs, 720000);
  assert.equal(activity.startedAt, Date.parse(result.data.sessions[0].startedAt));
  sessions.reopenSession(result.data, session.id);
  assert.equal(createActivities(state).list()[0].status, 'running');
});

test('game quota failures leave both the sessions and shared activities unchanged', async t => {
  const { state, storage, values } = await setup(t);
  const data = prepared();
  const before = state.read().value;
  const primary = values.get('daily:v1');
  storage.setItem = () => { throw new Error('QuotaExceededError'); };
  assert.throws(() => start(data), /QuotaExceeded/);
  assert.equal(values.get('daily:v1'), primary);
  assert.deepEqual(state.read().value, before);
});

test('game stale domain saves reject instead of overwriting a newer module state', async t => {
  await setup(t);
  const old = prepared();
  createPlayer(loadData(), { name: 'Other tab' });
  assert.throws(() => createPlayer(old, { name: 'Stale write' }), /changed/i);
  assert.equal(loadData().players.length, 3);
});

test('game replacement previews preserve shared language and restore active timing with recovery', async t => {
  const { service, state, values } = await setup(t);
  const data = start(prepared()).data;
  const backup = { ...data, settings: { ...data.settings, language: 'es' } };
  const before = [...values];
  const preview = service.previewImport(JSON.stringify(backup));
  assert.deepEqual(preview.counts, { players: 2, games: 1, sessions: 1 });
  assert.deepEqual([...values], before);
  service.applyImport(preview);
  assert.equal(loadData().settings.language, 'en');
  assert.equal(createActivities(state).list()[0].reference, data.sessions[0].id);
  assert.ok(values.has('daily:v1:recovery'));
  assert.throws(() => service.applyImport(preview));
});

test('game future modules and stale import previews remain untouched', async t => {
  const { service, state, values } = await setup(t);
  const preview = service.previewImport(JSON.stringify(prepared()));
  createPlayer(loadData(), { name: 'Changed' });
  assert.throws(() => service.applyImport(preview), /changed/i);
  state.commit(current => ({ ...current, modules: { ...current.modules, games: { version: 99, data: {} } } }));
  const before = [...values];
  assert.throws(() => loadData(), /version/i);
  assert.deepEqual([...values], before);
});
