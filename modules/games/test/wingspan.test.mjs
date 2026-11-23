import test from 'node:test';
import assert from 'node:assert/strict';
import { setupWingspan, startWingspan, fillWingspan } from './wingspan-helpers.mjs';
import * as sessions from '../src/backend/features/sessions.js';
import { updateGame, normalizeGame } from '../src/backend/features/games.js';
import { buildStats } from '../src/backend/features/stats.js';
import { wingspanSessionErrors } from '../src/scoring/wingspan/index.js';
import { wingspanSpanish } from '../src/scoring/wingspan/copy.js';
import { validGames } from '../src/validation.js';
import { createActivities } from '../../../packages/platform/src/activities.js';

test('Wingspan starts from the Games catalog with fixed multiplayer bounds and no rounds', async t => {
  const { data } = await setupWingspan(t, 6);
  assert.equal(data.games[0].minPlayers, 2);
  assert.equal(data.games[0].maxPlayers, 5);
  const generic = normalizeGame({ ...data.games[0], scoringMode: 'highest_score_after_rounds', minPlayers: 0, maxPlayers: 0 });
  assert.equal(generic.minPlayers, null);
  assert.equal(generic.maxPlayers, null);
  const input = { gameId: data.games[0].id, playerIds: data.players.map(player => player.id) };
  assert.ok(sessions.startSession(data, input).errors.length);
  assert.ok(sessions.startSession(data, { ...input, playerIds: [data.players[0].id] }).errors.length);
  const started = startWingspan(data, 5);
  assert.deepEqual(started.sessions[0].rounds, []);
  assert.equal(started.sessions[0].scorecard.version, 1);
  assert.equal(started.sessions[0].scorecard.players[data.players[0].id].categories.eggs, null);
  assert.ok(validGames(started));
});

test('Wingspan derives totals, preserves timing and feeds generic statistics and historical snapshots', async t => {
  const { data, state } = await setupWingspan(t);
  let current = startWingspan(data);
  const clock = createActivities(state).list()[0].startedAt;
  current = fillWingspan(current);
  assert.deepEqual(Object.values(sessions.getTotals(current.sessions[0])), [68, 64]);
  assert.equal(createActivities(state).list()[0].startedAt, clock);
  const done = sessions.finishSession(current, current.sessions[0].id);
  assert.deepEqual(done.errors, []);
  assert.deepEqual(done.data.sessions[0].winnerPlayerIds, [data.players[0].id]);
  assert.equal(buildStats(done.data).players[0].totalPoints, 68);
  assert.equal(createActivities(state).list()[0].status, 'completed');
  const changed = updateGame(done.data, data.games[0].id, { name: 'Different', scoringMode: 'highest_score_after_rounds', roundCount: 3 }).data;
  assert.equal(changed.sessions[0].scoringMode, 'wingspan_base');
  assert.deepEqual(Object.values(sessions.getTotals(changed.sessions[0])), [68, 64]);
});

test('Wingspan requires explicit category zeros and unused food only for tied leaders', async t => {
  const { data } = await setupWingspan(t);
  let current = startWingspan(data);
  const id = current.sessions[0].id;
  assert.ok(sessions.finishSession(current, id).errors.length);
  current = fillWingspan(current, [Array(6).fill(0), Array(6).fill(0)]);
  assert.ok(sessions.finishSession(current, id).errors.length);
  for (const [index, player] of data.players.entries()) {
    current = sessions.updateWingspanScore(current, { sessionId: id, playerId: player.id, category: 'unusedFood' }, index + 3).data;
  }
  assert.deepEqual(Object.values(sessions.getTotals(current.sessions[0])), [0, 0]);
  let done = sessions.finishSession(current, id);
  assert.deepEqual(done.errors, []);
  assert.deepEqual(done.data.sessions[0].winnerPlayerIds, [data.players[1].id]);
  current = sessions.reopenSession(done.data, id).data;
  current = sessions.updateWingspanScore(current, { sessionId: id, playerId: data.players[0].id, category: 'unusedFood' }, 4).data;
  done = sessions.finishSession(current, id);
  assert.deepEqual(done.data.sessions[0].winnerPlayerIds, data.players.map(player => player.id));
});

test('Wingspan rejects invalid edits and preserves storage, drafts and unrelated scoring boundaries', async t => {
  const { data, values, storage } = await setupWingspan(t);
  const current = startWingspan(data);
  const selection = { sessionId: current.sessions[0].id, playerId: data.players[0].id, category: 'birds' };
  const before = [...values];
  for (const value of [-1, 2.5, Infinity, Number.MAX_SAFE_INTEGER + 1, 'invalid']) {
    assert.ok(sessions.updateWingspanScore(current, selection, value).errors.length);
    assert.deepEqual([...values], before);
  }
  assert.ok(sessions.updateWingspanScore(current, { ...selection, playerId: 'missing' }, 3).errors.length);
  assert.ok(sessions.updateWingspanScore(current, { ...selection, category: 'nectar' }, 3).errors.length);
  assert.ok(sessions.addRound(current, current.sessions[0].id).errors.length);
  assert.ok(sessions.updateOutcome(current, current.sessions[0].id, data.players[0].id, 'win').errors.length);
  storage.setItem = () => { throw new Error('QuotaExceededError'); };
  assert.throws(() => sessions.updateWingspanScore(current, selection, 3), /QuotaExceeded/);
  assert.deepEqual([...values], before);
});

test('Wingspan backup validation preserves category data and rejects malformed payloads atomically', async t => {
  const { data, service, state } = await setupWingspan(t);
  const current = fillWingspan(startWingspan(data));
  const payload = JSON.parse(JSON.stringify(current));
  assert.ok(validGames(payload));
  const preview = service.previewImport(JSON.stringify(payload));
  service.applyImport(preview);
  assert.deepEqual(state.read().value.modules.games.data.sessions, payload.sessions);
  const before = state.read().value;
  for (const mutation of ['version', 'profile', 'player', 'category', 'negative', 'rounds', 'winners', 'overflow', 'too-many']) {
    const invalid = structuredClone(payload);
    const session = invalid.sessions[0];
    const card = session.scorecard;
    mutateBackup(mutation, session, card, data.players);
    assert.equal(validGames(invalid), false, mutation);
    for (const error of wingspanSessionErrors(session)) assert.ok(wingspanSpanish[error], `Missing Spanish error: ${error}`);
    assert.throws(() => service.previewImport(JSON.stringify(invalid)), /Wingspan/i);
    assert.deepEqual(state.read().value, before);
  }
});

function mutateBackup(mutation, session, card, players) {
  const mutations = {
    version: () => { card.version = 99; },
    profile: () => { card.profile = 'oceania'; },
    player: () => { card.players.stranger = card.players[players[0].id]; },
    category: () => { delete card.players[players[0].id].categories.eggs; },
    negative: () => { card.players[players[0].id].categories.birds = -1; },
    rounds: () => { session.rounds = [{ id: 'bad', roundNumber: 1, scores: {} }]; },
    winners: () => { session.status = 'completed'; session.completedAt = session.startedAt; session.winnerPlayerIds = [players[1].id]; },
    overflow: () => { card.players[players[0].id].categories.birds = Number.MAX_SAFE_INTEGER; },
    'too-many': () => { session.participants = Array(6).fill(session.participants[0]); }
  };
  mutations[mutation]();
}

test('Wingspan combined backups restore scorecards and reject unknown scorecard versions before writes', async t => {
  const { data, state } = await setupWingspan(t);
  const current = fillWingspan(startWingspan(data));
  const { connectDailyBackups } = await import('../../../apps/daily/src/backup/service.js');
  const backup = connectDailyBackups(state);
  const text = backup.exportBackup();
  const preview = backup.previewImport(text);
  assert.deepEqual(preview.data.modules.games.data.sessions, current.sessions);
  backup.applyImport(preview);
  const before = state.read().value;
  const invalid = JSON.parse(text);
  invalid.data.modules.games.data.sessions[0].scorecard.version = 99;
  assert.throws(() => backup.previewImport(JSON.stringify(invalid)), /invalid/i);
  assert.deepEqual(state.read().value, before);
});
