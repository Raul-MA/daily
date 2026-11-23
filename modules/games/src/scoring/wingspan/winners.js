import { wingspanTotals, completeCategories } from './scorecard.js';

export function tiedLeaders(session) {
  const totals = wingspanTotals(session);
  const best = Math.max(...Object.values(totals));
  return session.participants.filter(player => totals[player.playerId] === best).map(player => player.playerId);
}

export function wingspanWinners(session) {
  if (!completeCategories(session)) return [];
  const leaders = tiedLeaders(session);
  if (leaders.length < 2) return leaders;
  if (leaders.some(id => session.scorecard.players[id].unusedFood === null)) return [];
  const bestFood = Math.max(...leaders.map(id => session.scorecard.players[id].unusedFood));
  return leaders.filter(id => session.scorecard.players[id].unusedFood === bestFood);
}

export function completionErrors(session) {
  if (!completeCategories(session)) return ['Enter all six categories for every player, including zeros.'];
  const leaders = tiedLeaders(session);
  if (leaders.length > 1 && leaders.some(id => session.scorecard.players[id].unusedFood === null)) {
    return ['Enter unused food for tied leaders. It does not add points.'];
  }
  return [];
}
