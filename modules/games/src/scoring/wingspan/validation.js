import { categories, isWingspan, WINGSPAN_MODE, WINGSPAN_MAX_PLAYERS } from './categories.js';
import { categoryTotal } from './scorecard.js';
import { completionErrors, wingspanWinners } from './winners.js';

const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const sameKeys = (value, keys) => object(value) && Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key));
export const validCategoryValue = value => value === null || Number.isSafeInteger(value) && value >= 0;

export function wingspanGameErrors(game) {
  if (!isWingspan(game)) return [];
  return !validGameConfiguration(game)
    ? ['Wingspan base supports 2–5 players and competitive scoring.'] : [];
}

export function wingspanSessionErrors(session) {
  if (!isWingspan(session)) return session.scorecard === undefined ? [] : ['Category scorecards require Wingspan scoring.'];
  const errors = [];
  errors.push(...configurationErrors(session));
  const cardErrors = scorecardErrors(session);
  errors.push(...cardErrors);
  if (!errors.length && session.status === 'completed') errors.push(...completedErrors(session));
  return errors;
}

function scorecardErrors(session) {
  const card = session.scorecard;
  if (!object(card) || card.version !== 1 || card.profile !== WINGSPAN_MODE) return ['Wingspan scorecard version or profile is invalid.'];
  const ids = Array.isArray(session.participants) ? session.participants.map(player => player?.playerId) : [];
  if (new Set(ids).size !== ids.length || !sameKeys(card.players, ids)) return ['Wingspan scorecard players must match participants.'];
  return Object.values(card.players).flatMap(playerErrors);
}

function playerErrors(player) {
  if (!sameKeys(player, ['categories', 'unusedFood']) || !sameKeys(player.categories, categories.map(category => category.id))) return ['Wingspan scorecard must contain exactly six categories and unused food.'];
  if (![...Object.values(player.categories), player.unusedFood].every(validCategoryValue)) return ['Wingspan scores must be non-negative safe whole numbers.'];
  return Number.isSafeInteger(categoryTotal(player)) ? [] : ['Wingspan total is too large.'];
}

function completedErrors(session) {
  const errors = completionErrors(session);
  if (errors.length) return errors;
  const expected = wingspanWinners(session).sort();
  const actual = [...(session.winnerPlayerIds || [])].sort();
  if (JSON.stringify(expected) !== JSON.stringify(actual)) errors.push('Wingspan winners must match the scorecard.');
  return errors;
}

export function scoreSelectionErrors(session, selection, value) {
  if (!isWingspan(session) || session.status !== 'active') return ['Choose an active Wingspan session.'];
  if (!session.participants.some(player => player.playerId === selection.playerId)) return ['Choose a Wingspan participant.'];
  const known = selection.category === 'unusedFood' || categories.some(category => category.id === selection.category);
  if (!known || !validCategoryValue(value)) return ['Wingspan scores must be non-negative safe whole numbers.'];
  return [];
}

function configurationErrors(session) {
  const errors = [];
  if (!validPlayers(session)) errors.push('Wingspan base supports 2–5 players and competitive scoring.');
  if (session.rounds?.length !== 0 || session.results?.length !== 0) errors.push('Wingspan uses categories, not rounds or outcomes.');
  if (!validConfiguration(session) || session.collaborativeOutcome !== '') errors.push('Wingspan scoring configuration is invalid.');
  return errors;
}

function validPlayers(session) {
  return !session.isCollaborative && Array.isArray(session.participants) && session.participants.length >= 2 && session.participants.length <= WINGSPAN_MAX_PLAYERS;
}

function validConfiguration(session) {
  return session.roundCount == null && session.targetScore == null && session.higherScoreWins === true;
}

function validGameConfiguration(game) {
  return !game.isCollaborative && game.minPlayers === 2 && game.maxPlayers === WINGSPAN_MAX_PLAYERS && validConfiguration(game);
}
