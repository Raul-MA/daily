import { href } from '../../../../../packages/platform/src/router.js';
import { gameUI } from './context.js';
import { getState } from './state.js';
import { getActiveSession } from '../../backend/features/sessions.js';
import { render } from './render.js';

const routeNames = { games: 'play', gameNew: 'play', gameSession: 'session', gamesSession: 'session', gamesHistory: 'history', gameDetail: 'game', gamesCatalog: 'games', gamesPlayers: 'players', gamesStats: 'stats', gamesSettings: 'settings' };
const pages = { play: 'games', session: 'gamesSession', history: 'gamesHistory', game: 'gameDetail', games: 'gamesCatalog', players: 'gamesPlayers', stats: 'gamesStats', settings: 'gamesSettings' };

export function getRoute() {
  if (gameUI.route.page === 'gameSession' && gameUI.route.id !== getActiveSession(getState())?.id) return 'game';
  return routeNames[gameUI.route.page];
}
export function getRouteParam() { return gameUI.route.id ?? ''; }
export function navigate(value) {
  const [route, id] = value.split('/');
  let target = { page: pages[route], id };
  if (route === 'session') {
    const active = getActiveSession(getState());
    if (active) target = { page: 'gameSession', id: active.id };
  }
  const hash = href(target, gameUI.base).split('#')[1];
  if (location.hash === `#${hash}`) render();
  else location.hash = hash;
}
