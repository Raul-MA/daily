import { renderActiveSession } from './renderActiveSession.js';
import { renderHistory } from './renderHistory.js';
import { renderGameDetail } from './renderGameDetail.js';
import { getRouteParam } from './router.js';
import { renderGames } from './renderGames.js';
import { renderPlayers } from './renderPlayers.js';
import { renderStats } from './renderStats.js';
import { renderSettings } from './renderSettings.js';
import { renderPlay } from './renderPlay.js';

export function renderRoute(route, data) {
  if (route === "session") return renderActiveSession(data);
  if (route === "history") return renderHistory(data);
  if (route === "game") return renderGameDetail(data, getRouteParam());
  if (route === "games") return renderGames(data);
  if (route === "players") return renderPlayers(data);
  if (route === "stats") return renderStats(data);
  if (route === "settings") return renderSettings(data);
  return renderPlay(data);
}
