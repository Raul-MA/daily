import { gameUI } from './context.js';
import { visibleItems } from './visibleItems.js';
import { testIds } from './testIds.js';
import { escapeHtml } from '../components/components.js';
import { renderPlayerCatalog } from './renderPlayerCatalog.js';

export function renderPlayers(data) {
  const current = data.players.find((player) => player.id === gameUI.ui.editingPlayerId);
  const players = visibleItems(data.players, data.settings.showArchived);
  return `
    <section class="view-header">
      <p>Players</p>
      <h1>People at the table</h1>
    </section>
    <section class="ledger-block">
      <form data-testid="${testIds.playerForm}">
        <label>
          Name
          <input data-testid="${testIds.playerName}" name="name" value="${escapeHtml(current?.name || "")}" required>
        </label>
        <button class="primary" data-testid="${testIds.playerSave}" type="submit">${current ? "Save player" : "Add player"}</button>
      </form>
    </section>
    <section class="list">
      ${
        renderPlayerCatalog(data, players)
      }
    </section>
  `;
}
