import test from 'node:test';
import assert from 'node:assert/strict';
import { setupWingspan, startWingspan, fillWingspan } from './wingspan-helpers.mjs';
import * as sessions from '../src/backend/features/sessions.js';

async function reportFixture(t) {
  const { data } = await setupWingspan(t);
  const current = fillWingspan(startWingspan(data));
  const first = sessions.finishSession(current, current.sessions[0].id).data.sessions[0];
  const second = structuredClone(first);
  second.id = 'second';
  second.participants = [first.participants[0], { playerId: 'third', nameSnapshot: 'Archived', seatOrder: 1 }];
  second.scorecard.players = { [data.players[0].id]: { categories: { birds: 10, bonusCards: 0, goals: 0, eggs: 10, cachedFood: 0, tuckedCards: 0 }, unusedFood: null }, third: { categories: { birds: 0, bonusCards: 0, goals: 0, eggs: 0, cachedFood: 0, tuckedCards: 0 }, unusedFood: null } };
  const legacy = { ...first, id: 'legacy', scoringMode: 'highest_score_after_rounds', scorecard: undefined };
  const input = { ...data, sessions: [first, second, legacy, { ...first, id: 'active', status: 'active' }] };
  const { buildWingspanStats } = await import('../src/scoring/wingspan/index.js');
  return { data: input, buildWingspanStats };
}

test('Wingspan reports compare per-game averages, pooled point shares and unequal sample sizes', async t => {
  const { data, buildWingspanStats } = await reportFixture(t);
  const report = buildWingspanStats(data);
  const first = report.players.find(player => player.playerId === data.players[0].id);
  assert.equal(first.played, 2);
  assert.equal(first.categories.birds.total, 40);
  assert.equal(first.categories.birds.average, 20);
  assert.equal(first.categories.birds.best, 30);
  assert.equal(first.categories.birds.share, 40 / 88 * 100);
  assert.deepEqual(first.leadingCategories, ['birds']);
  assert.equal(report.players.find(player => player.playerId === data.players[1].id).played, 1);
  assert.equal(report.recordedSessions, 2);
  assert.equal(report.uncategorizedSessions, 1);
});

test('Wingspan reports preserve tied categories, zero totals, archived names and filter scope', async t => {
  const { data, buildWingspanStats } = await reportFixture(t);
  const only = { ...data, sessions: [data.sessions[1]] };
  const report = buildWingspanStats(only);
  assert.deepEqual(report.players[0].leadingCategories, ['birds', 'eggs']);
  const archived = report.players.find(player => player.playerId === 'third');
  assert.equal(archived.name, 'Archived');
  assert.equal(archived.categories.eggs.share, null);
  assert.deepEqual(archived.leadingCategories, []);
  assert.equal(buildWingspanStats(data, { gameId: 'other' }).players.length, 0);
  assert.equal(buildWingspanStats(data, { playerId: 'third' }).players.length, 1);
  const { renderWingspanReports } = await import('../src/scoring/wingspan/reports-view.js');
  const html = renderWingspanReports(data, { filters: { gameId: 'removed-by-import', playerId: 'removed-player' } });
  assert.match(html, /Player 1/);
  assert.match(html, /Player 2/);
});

test('Wingspan reports recompute after corrections and exclude reopened or incomplete scorecards', async t => {
  const { data, buildWingspanStats } = await reportFixture(t);
  const original = buildWingspanStats(data);
  data.sessions[0].status = 'active';
  assert.equal(buildWingspanStats(data).recordedSessions, 1);
  data.sessions[0].status = 'completed';
  data.sessions[0].scorecard.players[data.players[0].id].categories.birds = 40;
  assert.equal(buildWingspanStats(data).players[0].categories.birds.total, 50);
  data.sessions[0].scorecard.players[data.players[0].id].categories.eggs = null;
  assert.equal(buildWingspanStats(data).recordedSessions, 1);
  assert.equal(original.players[0].categories.birds.total, 40);
});
