import assert from 'node:assert/strict';
import { createDailyState } from '../../../packages/data/src/daily-state.js';
import { connectGames } from '../src/service.js';
import { loadData } from '../src/backend/core/storage.js';
import { createPlayer } from '../src/backend/features/players.js';
import { createGame } from '../src/backend/features/games.js';
import * as sessions from '../src/backend/features/sessions.js';

export async function setupWingspan(t, count = 2) {
  const values = new Map();
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  const state = createDailyState(storage);
  const service = connectGames(state);
  t.after(service.stop);
  let data = loadData();
  for (let i = 0; i < count; i += 1) data = createPlayer(data, { name: `Player ${i + 1}` }).data;
  const result = createGame(data, { name: 'Wingspan', scoringMode: 'wingspan_base' });
  assert.deepEqual(result.errors, [], 'Wingspan base must be an accepted scoring option');
  return { data: result.data, service, state, storage, values };
}

export function startWingspan(data, count = data.players.length) {
  const result = sessions.startSession(data, { gameId: data.games[0].id, playerIds: data.players.slice(0, count).map(player => player.id) });
  assert.deepEqual(result.errors, []);
  return result.data;
}

export function fillWingspan(data, scores = [[30, 5, 10, 12, 3, 8], [20, 6, 8, 20, 4, 6]]) {
  let current = data;
  const session = data.sessions[0];
  const keys = ['birds', 'bonusCards', 'goals', 'eggs', 'cachedFood', 'tuckedCards'];
  for (const [index, player] of session.participants.entries()) {
    for (const [categoryIndex, category] of keys.entries()) {
      const result = sessions.updateWingspanScore(current, { sessionId: session.id, playerId: player.playerId, category }, scores[index][categoryIndex]);
      assert.deepEqual(result.errors, []);
      current = result.data;
    }
  }
  return current;
}
