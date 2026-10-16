import { copy } from './copy.js';
import { gameUI } from './context.js';
import { historySortLabel } from './historySortLabel.js';

export function getHistoryFilterSummary(data) {
  const selectedGame = data.games.find((game) => game.id === gameUI.ui.history.gameId);
  const selectedPlayer = data.players.find((player) => player.id === gameUI.ui.history.playerId);
  const selectedWinner = data.players.find((player) => player.id === gameUI.ui.history.winnerId);
  return [
    gameUI.ui.history.search.trim() ? copy("Search: {value}", { value: gameUI.ui.history.search.trim() }) : "",
    selectedGame ? copy("Game: {value}", { value: selectedGame.name }) : "",
    selectedPlayer ? copy("Player: {value}", { value: selectedPlayer.name }) : "",
    selectedWinner ? copy("Winner: {value}", { value: selectedWinner.name }) : "",
    gameUI.ui.history.dateFrom ? copy("From: {value}", { value: gameUI.ui.history.dateFrom }) : "",
    gameUI.ui.history.dateTo ? copy("To: {value}", { value: gameUI.ui.history.dateTo }) : "",
    gameUI.ui.history.sort !== "newest" ? copy("Sort: {value}", { value: historySortLabel(gameUI.ui.history.sort) }) : ""
  ].filter(Boolean);
}
