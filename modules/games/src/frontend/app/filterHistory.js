import { gameUI } from './context.js';
import { playerDisplayName } from './playerDisplayName.js';
import { sortHistory } from './sortHistory.js';

export function filterHistory(data) {
  const search = gameUI.ui.history.search.trim().toLowerCase();
  return data.sessions
    .filter((session) => session.status === "completed")
    .filter((session) => !gameUI.ui.history.gameId || session.gameId === gameUI.ui.history.gameId)
    .filter((session) => !gameUI.ui.history.playerId || session.participants.some((p) => p.playerId === gameUI.ui.history.playerId))
    .filter((session) => !gameUI.ui.history.winnerId || session.winnerPlayerIds.includes(gameUI.ui.history.winnerId))
    .filter((session) => !gameUI.ui.history.dateFrom || session.completedAt?.slice(0, 10) >= gameUI.ui.history.dateFrom)
    .filter((session) => !gameUI.ui.history.dateTo || session.completedAt?.slice(0, 10) <= gameUI.ui.history.dateTo)
    .filter((session) => {
      if (!search) return true;
      const names = session.participants.map((p) => playerDisplayName(data, session, p.playerId)).join(" ");
      return `${session.gameNameSnapshot} ${names}`.toLowerCase().includes(search);
    })
    .sort((a, b) => sortHistory(data, a, b));
}
