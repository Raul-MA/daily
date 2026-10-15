import { listen, guard } from './events.js';
import { testIds } from './testIds.js';
import { gameUI } from './context.js';
import { readGameFormDraft } from './readGameFormDraft.js';
import { render } from './render.js';
import { getState } from './state.js';
import { readGameInput } from './readGameInput.js';
import { updateGame, createGame, removeGame } from '../../backend/features/games.js';
import { applyResult } from './applyResult.js';

export function bindGames() {
  listen(`[data-testid="${testIds.gameCollaborative}"]`, "change", (event) => {
    gameUI.ui.gameFormDraft = readGameFormDraft(event.target.form);
    render();
  });
  listen(`[data-testid="${testIds.gameMode}"]`, "change", (event) => {
    gameUI.ui.gameFormDraft = readGameFormDraft(event.target.form);
    gameUI.ui.gameFormMode = event.target.value;
    render();
  });
  listen(`[data-testid="${testIds.gameForm}"]`, "submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const existingGame = getState().games.find((game) => game.id === gameUI.ui.editingGameId);
    const settings = getState().settings;
    const input = readGameInput(form, existingGame, settings);
    const result = gameUI.ui.editingGameId ? updateGame(getState(), gameUI.ui.editingGameId, input) : createGame(getState(), input);
    if (!result.errors.length) {
      gameUI.ui.editingGameId = null;
      gameUI.ui.gameFormMode = "";
      gameUI.ui.gameFormDraft = null;
    }
    applyResult(result, "Game saved.");
  });
  gameUI.app.querySelectorAll(`[data-testid="${testIds.gameItem}"]`).forEach((node) => {
    node.querySelector("[data-action='edit-game']")?.addEventListener("click", guard(() => {
      gameUI.ui.editingGameId = node.dataset.id;
      gameUI.ui.gameFormMode = "";
      gameUI.ui.gameFormDraft = null;
      render();
    }));
    node.querySelector("[data-action='archive-game']")?.addEventListener("click", guard(() => {
      if (!window.confirm("Archive or delete this game?")) return;
      applyResult(removeGame(getState(), node.dataset.id), "Game updated.");
    }));
  });
}
