import { listen, guard } from './events.js';
import { testIds } from './testIds.js';
import { render } from './render.js';
import { gameUI } from './context.js';
import { createPlayer } from '../../backend/features/players.js';
import { getState } from './state.js';
import { applyResult } from './applyResult.js';
import { startSession } from '../../backend/features/sessions.js';
import { navigate } from './router.js';

export function bindPlay() {
  enforceWingspanLimit();
  listen(`[data-testid="${testIds.playGameSelect}"]`, "change", event => {
    gameUI.ui.selectedGameId = event.target.value;
    render();
    enforceWingspanLimit();
  });
  gameUI.app.querySelectorAll(`[data-testid="${testIds.playPlayerToggle}"]`).forEach((input) => {
    input.addEventListener("change", guard(() => {
      if (input.checked) gameUI.ui.selectedPlayers.add(input.value);
      else gameUI.ui.selectedPlayers.delete(input.value);
      enforceWingspanLimit();
    }));
  });
  listen(`[data-testid="${testIds.inlinePlayerAdd}"]`, "click", () => {
    const input = gameUI.app.querySelector(`[data-testid="${testIds.inlinePlayerName}"]`);
    const result = createPlayer(getState(), { name: input.value });
    applyResult(result, "Player added.");
    if (!result.errors.length) {
      const playerId = result.data.players.find(player => player.name === input.value.trim())?.id;
      if (playerId && !enforceWingspanLimit()) gameUI.ui.selectedPlayers.add(playerId);
      render();
    }
  });
  listen(`[data-testid="${testIds.playStart}"]`, "click", () => {
    const gameId = gameUI.app.querySelector(`[data-testid="${testIds.playGameSelect}"]`)?.value;
    const result = startSession(getState(), {
      gameId,
      playerIds: [...gameUI.ui.selectedPlayers],
      roundCount: gameUI.app.querySelector("[name='roundCount']")?.value,
      targetScore: gameUI.app.querySelector("[name='targetScore']")?.value
    });
    applyResult(result, "Session started.");
    if (!result.errors.length) navigate("session");
  });
}

function enforceWingspanLimit() {
  const id = gameUI.app.querySelector(`[data-testid="${testIds.playGameSelect}"]`)?.value;
  const game = getState().games.find(item => item.id === id);
  const limitReached = game?.scoringMode === 'wingspan_base' && gameUI.ui.selectedPlayers.size >= 5;
  for (const input of gameUI.app.querySelectorAll(`[data-testid="${testIds.playPlayerToggle}"]`)) input.disabled = limitReached && !input.checked;
  return limitReached;
}
