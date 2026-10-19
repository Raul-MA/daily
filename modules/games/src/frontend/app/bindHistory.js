import { copy } from './copy.js';
import { listen, guard } from './events.js';
import { testIds } from './testIds.js';
import { gameUI } from './context.js';
import { render } from './render.js';
import { navigate } from './router.js';
import { applyResult } from './applyResult.js';
import { deleteSession, reopenSession } from '../../backend/features/sessions.js';
import { getState } from './state.js';

export function bindHistory() {
  listen(`[data-testid="${testIds.historyFilterToggle}"]`, "click", () => {
    gameUI.ui.historyFiltersOpen = !gameUI.ui.historyFiltersOpen;
    render();
  });
  listen(`[data-testid="${testIds.historySearch}"]`, "input", (event) => {
    gameUI.ui.history.search = event.target.value;
    render();
  });
  listen(`[data-testid="${testIds.historyGameFilter}"]`, "change", (event) => {
    gameUI.ui.history.gameId = event.target.value;
    render();
  });
  listen(`[data-testid="${testIds.historyPlayerFilter}"]`, "change", (event) => {
    gameUI.ui.history.playerId = event.target.value;
    render();
  });
  listen(`[data-testid="${testIds.historyWinnerFilter}"]`, "change", (event) => {
    gameUI.ui.history.winnerId = event.target.value;
    render();
  });
  listen(`[data-testid="${testIds.historyDateFrom}"]`, "change", (event) => {
    gameUI.ui.history.dateFrom = event.target.value;
    render();
  });
  listen(`[data-testid="${testIds.historyDateTo}"]`, "change", (event) => {
    gameUI.ui.history.dateTo = event.target.value;
    render();
  });
  listen(`[data-testid="${testIds.historySort}"]`, "change", (event) => {
    gameUI.ui.history.sort = event.target.value;
    render();
  });
  gameUI.app.querySelectorAll(`[data-testid="${testIds.historyItem}"]`).forEach((node) => {
    const openDetails = () => navigate(`game/${node.dataset.id}`);
    node.addEventListener("click", guard((event) => {
      if (event.target.closest("button")) return;
      openDetails();
    }));
    node.querySelector("[data-action='view-session']")?.addEventListener("click", guard(openDetails));
    node.querySelector("[data-action='delete-session']")?.addEventListener("click", guard(() => {
      if (!window.confirm(copy("Delete this completed session?"))) return;
      applyResult(deleteSession(getState(), node.dataset.id), "Session deleted.");
    }));
    node.querySelector("[data-action='edit-session']")?.addEventListener("click", guard(() => {
      if (!window.confirm(copy("Edit this completed session? Stats will change."))) return;
      applyResult(reopenSession(getState(), node.dataset.id), "Session reopened.");
      navigate("session");
    }));
  });
}
