import { copy } from './copy.js';
import { listen, guard } from './events.js';
import { testIds } from './testIds.js';
import { gameUI } from './context.js';
import { updatePlayer, createPlayer, removePlayer } from '../../backend/features/players.js';
import { getState } from './state.js';
import { applyResult } from './applyResult.js';
import { render } from './render.js';

export function bindPlayers() {
  listen(`[data-testid="${testIds.playerForm}"]`, "submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const result = gameUI.ui.editingPlayerId
      ? updatePlayer(getState(), gameUI.ui.editingPlayerId, { name: form.get("name") })
      : createPlayer(getState(), { name: form.get("name") });
    if (!result.errors.length) gameUI.ui.editingPlayerId = null;
    applyResult(result, "Player saved.");
  });
  gameUI.app.querySelectorAll(`[data-testid="${testIds.playerItem}"]`).forEach((node) => {
    node.querySelector("[data-action='edit-player']")?.addEventListener("click", guard(() => {
      gameUI.ui.editingPlayerId = node.dataset.id;
      render();
    }));
    node.querySelector("[data-action='archive-player']")?.addEventListener("click", guard(() => {
      if (!window.confirm(copy("Archive or delete this player?"))) return;
      applyResult(removePlayer(getState(), node.dataset.id), "Player updated.");
    }));
  });
}
