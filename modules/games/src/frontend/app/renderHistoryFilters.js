import { gameUI } from './context.js';
import { testIds } from './testIds.js';
import { escapeHtml, option } from '../components/components.js';

export function renderHistoryFilters(data) {
 return gameUI.ui.historyFiltersOpen
          ? `<div class="filter-bar">
              <input data-testid="${testIds.historySearch}" placeholder="Search" value="${escapeHtml(gameUI.ui.history.search)}">
              <select data-testid="${testIds.historyGameFilter}">
                ${option("", "All games", gameUI.ui.history.gameId)}
                ${data.games.map((game) => option(game.id, game.name, gameUI.ui.history.gameId)).join("")}
              </select>
              <select data-testid="${testIds.historyPlayerFilter}">
                ${option("", "All players", gameUI.ui.history.playerId)}
                ${data.players.map((player) => option(player.id, player.name, gameUI.ui.history.playerId)).join("")}
              </select>
              <select data-testid="${testIds.historyWinnerFilter}">
                ${option("", "Any winner", gameUI.ui.history.winnerId)}
                ${data.players.map((player) => option(player.id, player.name, gameUI.ui.history.winnerId)).join("")}
              </select>
              <input data-testid="${testIds.historyDateFrom}" type="date" value="${escapeHtml(gameUI.ui.history.dateFrom)}">
              <input data-testid="${testIds.historyDateTo}" type="date" value="${escapeHtml(gameUI.ui.history.dateTo)}">
              <select data-testid="${testIds.historySort}">
                ${option("newest", "Newest first", gameUI.ui.history.sort)}
                ${option("oldest", "Oldest first", gameUI.ui.history.sort)}
                ${option("game", "Game name", gameUI.ui.history.sort)}
                ${option("winner", "Winner name", gameUI.ui.history.sort)}
              </select>
            </div>`
          : "";
}
