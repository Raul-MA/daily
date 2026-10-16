import { copy } from './copy.js';
import { gameUI } from './context.js';
import { testIds } from './testIds.js';
import { escapeHtml, option } from '../components/components.js';

export function renderHistoryFilters(data) {
 return gameUI.ui.historyFiltersOpen
          ? `<div class="filter-bar">
              <input data-testid="${testIds.historySearch}" placeholder="${copy("Search")}" value="${escapeHtml(gameUI.ui.history.search)}">
              <select data-testid="${testIds.historyGameFilter}">
                ${option("", copy("All games"), gameUI.ui.history.gameId)}
                ${data.games.map((game) => option(game.id, game.name, gameUI.ui.history.gameId)).join("")}
              </select>
              <select data-testid="${testIds.historyPlayerFilter}">
                ${option("", copy("All players"), gameUI.ui.history.playerId)}
                ${data.players.map((player) => option(player.id, player.name, gameUI.ui.history.playerId)).join("")}
              </select>
              <select data-testid="${testIds.historyWinnerFilter}">
                ${option("", copy("Any winner"), gameUI.ui.history.winnerId)}
                ${data.players.map((player) => option(player.id, player.name, gameUI.ui.history.winnerId)).join("")}
              </select>
              <input data-testid="${testIds.historyDateFrom}" type="date" value="${escapeHtml(gameUI.ui.history.dateFrom)}">
              <input data-testid="${testIds.historyDateTo}" type="date" value="${escapeHtml(gameUI.ui.history.dateTo)}">
              <select data-testid="${testIds.historySort}">
                ${option("newest", copy("Newest first"), gameUI.ui.history.sort)}
                ${option("oldest", copy("Oldest first"), gameUI.ui.history.sort)}
                ${option("game", copy("Game name"), gameUI.ui.history.sort)}
                ${option("winner", copy("Winner name"), gameUI.ui.history.sort)}
              </select>
            </div>`
          : "";
}
