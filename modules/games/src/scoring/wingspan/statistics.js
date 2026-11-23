import { categories, isWingspan } from './categories.js';
import { completeCategories } from './scorecard.js';
import { wingspanSessionErrors } from './validation.js';

export function buildWingspanStats(data, filters = {}) {
  const gameIds = new Set(data.games.filter(isWingspan).map(game => game.id));
  data.sessions.filter(isWingspan).forEach(session => gameIds.add(session.gameId));
  const completed = data.sessions.filter(session => session.status === 'completed' && (!filters.gameId || session.gameId === filters.gameId));
  const recorded = completed.filter(session => isWingspan(session) && validReportCard(session) && completeCategories(session));
  const byPlayer = new Map();
  for (const session of recorded) {
    for (const participant of session.participants) {
      if (!filters.playerId || filters.playerId === participant.playerId) addResult(byPlayer, { data, session, participant });
    }
  }
  return {
    players: [...byPlayer.values()].map(finishPlayer), recordedSessions: recorded.length,
    uncategorizedSessions: completed.filter(session => !isWingspan(session) && gameIds.has(session.gameId)).length
  };
}

function validReportCard(session) {
  return wingspanSessionErrors({ ...session, status: 'active' }).length === 0;
}

function addResult(byPlayer, { data, session, participant }) {
  const id = participant.playerId;
  const stat = byPlayer.get(id) || {
    playerId: id, name: data.players.find(player => player.id === id)?.name || participant.nameSnapshot,
    played: 0, categories: Object.fromEntries(categories.map(category => [category.id, { total: 0, best: 0 }]))
  };
  stat.played += 1;
  for (const category of categories) {
    const value = session.scorecard.players[id].categories[category.id];
    const metric = stat.categories[category.id];
    metric.total += value;
    metric.best = Math.max(metric.best, value);
  }
  byPlayer.set(id, stat);
}

function finishPlayer(stat) {
  const total = Object.values(stat.categories).reduce((sum, metric) => sum + metric.total, 0);
  const metrics = Object.fromEntries(Object.entries(stat.categories).map(([id, metric]) => [id, {
    ...metric, average: metric.total / stat.played, share: total > 0 ? metric.total / total * 100 : null
  }]));
  const largest = Math.max(...Object.values(metrics).map(metric => metric.average));
  const leadingCategories = categories.filter(category => largest > 0 && metrics[category.id].average === largest).map(category => category.id);
  return { ...stat, categories: metrics, leadingCategories };
}
