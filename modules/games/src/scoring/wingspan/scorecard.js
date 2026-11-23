import { categories, WINGSPAN_MODE } from './categories.js';

export function createScorecard(participants) {
  return { version: 1, profile: WINGSPAN_MODE, players: Object.fromEntries(participants.map(player => [player.playerId || player.id, {
    categories: Object.fromEntries(categories.map(category => [category.id, null])), unusedFood: null
  }])) };
}

export function categoryTotal(player) {
  return categories.reduce((total, category) => total + (player?.categories?.[category.id] ?? 0), 0);
}

export function wingspanTotals(session) {
  return Object.fromEntries(session.participants.map(player => [player.playerId, categoryTotal(session.scorecard?.players?.[player.playerId])]));
}

export function setCategory(scorecard, selection, value) {
  const player = scorecard.players[selection.playerId];
  const next = selection.category === 'unusedFood' ? { ...player, unusedFood: value }
    : { ...player, categories: { ...player.categories, [selection.category]: value } };
  return { ...scorecard, players: { ...scorecard.players, [selection.playerId]: next } };
}

export function completeCategories(session) {
  return session.participants.every(player => categories.every(category => session.scorecard?.players?.[player.playerId]?.categories?.[category.id] != null));
}
