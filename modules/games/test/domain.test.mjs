import test from 'node:test';
import assert from 'node:assert/strict';
import { loadModule } from '../../../tests/support/load-module.mjs';

async function setup() {
  const values = new Map();
  globalThis.localStorage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
  const schema = await loadModule('games', 'backend/core/schema.js');
  const players = await loadModule('games', 'backend/features/players.js');
  const games = await loadModule('games', 'backend/features/games.js');
  const sessions = await loadModule('games', 'backend/features/sessions.js');
  const stats = await loadModule('games', 'backend/features/stats.js');
  const backup = await loadModule('games', 'backend/features/importExport.js');
  let data = players.createPlayer(schema.createEmptyData(), { name: 'Ada 🌱' }).data;
  data = players.createPlayer(data, { name: 'Grace' }).data;
  data = games.createGame(data, { name: 'Azul ☕', scoringMode: 'highest_score_after_rounds', roundCount: 3, higherScoreWins: true }).data;
  return { data, schema, players, games, sessions, stats, backup, values };
}
function start(api, data) { return api.startSession(data, { gameId: data.games[0].id, playerIds: data.players.map(player => player.id) }).data; }
function score(api, data, selection) {
  const session = data.sessions[0];
  const roundId = session.rounds[0].id;
  const playerId = session.participants[selection.seat].playerId;
  if (process.env.DAILY_SOURCE_ROOT) return api.updateScore(data, session.id, roundId, playerId, selection.value);
  return api.updateScore(data, { sessionId: session.id, roundId, playerId }, selection.value);
}

test('game sessions snapshot names and configuration and allow only one active session', async () => {
  const { data, sessions, games, players } = await setup();
  const started = start(sessions, data);
  const snapshot = structuredClone(started.sessions[0]);
  assert.match(sessions.startSession(started, { gameId: data.games[0].id, playerIds: [] }).errors.join(' '), /active/);
  const changed = players.updatePlayer(games.updateGame(started, data.games[0].id, { name: 'Renamed', roundCount: 7 }).data, data.players[0].id, { name: 'New name' }).data;
  assert.deepEqual(changed.sessions[0], snapshot);
  assert.equal(snapshot.gameNameSnapshot, 'Azul ☕');
  assert.equal(snapshot.participants[0].nameSnapshot, 'Ada 🌱');
});

test('round scores preserve negatives and shared ties while invalid fractions do not save', async () => {
  const { data, sessions, values } = await setup();
  let current = start(sessions, data);
  current = score(sessions, current, { seat: 0, value: -3 }).data;
  current = score(sessions, current, { seat: 1, value: -3 }).data;
  const before = [...values];
  assert.match(score(sessions, current, { seat: 0, value: 2.5 }).errors.join(' '), /whole/);
  assert.deepEqual([...values], before);
  const result = sessions.finishSession(current, current.sessions[0].id);
  assert.deepEqual(result.data.sessions[0].winnerPlayerIds, data.players.map(player => player.id));
  assert.deepEqual(Object.values(sessions.getTotals(result.data.sessions[0])), [-3, -3]);
});

test('removing the final round retains an editable zero round and sequential numbering', async () => {
  const { data, sessions } = await setup();
  let current = start(sessions, data);
  current = sessions.addRound(current, current.sessions[0].id).data;
  current = sessions.removeRound(current, current.sessions[0].id, current.sessions[0].rounds[0].id).data;
  assert.deepEqual(current.sessions[0].rounds.map(round => round.roundNumber), [1]);
  current = sessions.removeRound(current, current.sessions[0].id, current.sessions[0].rounds[0].id).data;
  assert.equal(current.sessions[0].rounds.length, 1);
  assert.deepEqual(Object.values(sessions.getTotals(current.sessions[0])), [0, 0]);
});

test('first to points always favors the higher score while lowest-score games retain their rule', async () => {
  const { data, sessions } = await setup();
  let current = start(sessions, data);
  current = score(sessions, current, { seat: 0, value: 4 }).data;
  current = score(sessions, current, { seat: 1, value: 9 }).data;
  const session = current.sessions[0];
  assert.deepEqual(sessions.getWinnerPlayerIds({ ...session, higherScoreWins: false }), [data.players[0].id]);
  assert.deepEqual(sessions.getWinnerPlayerIds({ ...session, scoringMode: 'first_to_points', higherScoreWins: false }), [data.players[1].id]);
});

test('competitive outcomes require every result and retain separate wins ties and losses', async () => {
  const { data, games, sessions, stats } = await setup();
  let current = games.updateGame(data, data.games[0].id, { scoringMode: 'win_loss_tie' }).data;
  current = start(sessions, current);
  const id = current.sessions[0].id;
  assert.match(sessions.finishSession(current, id).errors.join(' '), /every player/);
  current = sessions.updateOutcome(current, id, data.players[0].id, 'win').data;
  current = sessions.updateOutcome(current, id, data.players[1].id, 'loss').data;
  current = sessions.finishSession(current, id).data;
  assert.equal(stats.buildStats(current).players[0].wins, 1);
  assert.equal(stats.buildStats(current).players[1].losses, 1);
});

test('collaborative solo outcomes have no individual winners or competitive head to head', async () => {
  const { data, games, sessions, stats } = await setup();
  let current = games.updateGame(data, data.games[0].id, { isCollaborative: true }).data;
  current = sessions.startSession(current, { gameId: data.games[0].id, playerIds: [data.players[0].id] }).data;
  const id = current.sessions[0].id;
  assert.match(sessions.finishSession(current, id).errors.join(' '), /team result/);
  current = sessions.updateCollaborativeOutcome(current, id, 'win').data;
  current = sessions.finishSession(current, id).data;
  assert.deepEqual(current.sessions[0].winnerPlayerIds, []);
  assert.deepEqual(current.sessions[0].rounds, []);
  assert.equal(stats.buildStats(current).players[0].collaborativeWins, 1);
  assert.equal(stats.buildStats(current).players[0].played, 0);
  assert.equal(stats.buildHeadToHead(current, ...data.players.map(player => player.id)).summary.played, 0);
});

test('history archives referenced records and duration overrides control derived statistics', async () => {
  const { data, sessions, players, games, stats } = await setup();
  let current = start(sessions, data);
  current = sessions.finishSessionWithTiming(current, current.sessions[0].id, { startedAt: '2026-01-01T12:00:00Z', completedAt: '2026-01-01T12:30:00Z', durationMinutesOverride: 17 }).data;
  current = players.removePlayer(current, data.players[0].id).data;
  current = games.removeGame(current, data.games[0].id).data;
  assert.equal(current.players.find(player => player.id === data.players[0].id).archived, true);
  assert.equal(current.games[0].archived, true);
  assert.equal(current.sessions[0].participants[0].nameSnapshot, 'Ada 🌱');
  assert.equal(sessions.getDurationMinutes(current.sessions[0]), 17);
  assert.equal(stats.buildStats(current).games[0].averageDurationMinutes, 17);
});

test('full game backups reject broken references duplicates and future major versions without mutation', async () => {
  const { data, sessions, backup, values } = await setup();
  const current = start(sessions, data);
  const payload = JSON.parse(backup.createExportPayload(current));
  assert.equal(payload.schemaVersion, '1.0');
  assert.equal(payload.sessions[0].status, 'active');
  const before = [...values];
  for (const invalid of [{ ...payload, players: [] }, { ...payload, games: [] }, { ...payload, players: [...payload.players, payload.players[0]] }, { ...payload, schemaVersion: '99.0' }]) {
    assert.ok(backup.replaceFromBackup(invalid).errors.length > 0);
    assert.deepEqual([...values], before);
  }
  const restored = backup.replaceFromBackup(payload);
  assert.deepEqual(restored.errors, []);
  assert.deepEqual(restored.data.sessions, current.sessions);
});
