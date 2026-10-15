import { gameUI } from './context.js';
import { historySortLabel } from './historySortLabel.js';

export function getHistoryFilterSummary(data) {
  const selectedGame = data.games.find((game) => game.id === gameUI.ui.history.gameId);
  const selectedPlayer = data.players.find((player) => player.id === gameUI.ui.history.playerId);
  const selectedWinner = data.players.find((player) => player.id === gameUI.ui.history.winnerId);
  return [
    gameUI.ui.history.search.trim() ? `Search: ${gameUI.ui.history.search.trim()}` : "",
    selectedGame ? `Game: ${selectedGame.name}` : "",
    selectedPlayer ? `Player: ${selectedPlayer.name}` : "",
    selectedWinner ? `Winner: ${selectedWinner.name}` : "",
    gameUI.ui.history.dateFrom ? `From: ${gameUI.ui.history.dateFrom}` : "",
    gameUI.ui.history.dateTo ? `To: ${gameUI.ui.history.dateTo}` : "",
    gameUI.ui.history.sort !== "newest" ? `Sort: ${historySortLabel(gameUI.ui.history.sort)}` : ""
  ].filter(Boolean);
}
