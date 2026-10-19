import { copy } from './copy.js';
import { getActiveSession } from '../../backend/features/sessions.js';
import { visibleItems } from './visibleItems.js';
import { pruneSelectedPlayers } from './pruneSelectedPlayers.js';
import { gameUI } from './context.js';
import { testIds } from './testIds.js';
import { renderPlaySetup } from './renderPlaySetup.js';

export function renderPlay(data) {
  const active = getActiveSession(data);
  const games = visibleItems(data.games, data.settings.showArchived);
  const players = data.players.filter((player) => !player.archived);
  pruneSelectedPlayers(players);
  const selectedGame = games.find((game) => game.id === (gameUI.ui.selectedGameId || gameUI.host.querySelector(`[data-testid="${testIds.playGameSelect}"]`)?.value || games[0]?.id));

  return `
    <section class="view-header">
      <p>${copy("Play")}</p>
      <h1>${copy("Set the table")}</h1>
    </section>
    ${
      renderPlaySetup({ data, active, games, players, selectedGame })
    }
  `;
}
