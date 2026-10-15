import { testIds } from './testIds.js';
import { escapeHtml } from '../components/components.js';
import { t } from '../../backend/core/i18n.js';

export function renderPlayerCatalog(data, players) {
 return players.length
          ? players
              .map(
                (player) => `
                  <article class="list-row ${player.archived ? "archived" : ""}" data-testid="${testIds.playerItem}" data-id="${escapeHtml(player.id)}">
                    <div>
                      <h2>${escapeHtml(player.name)}</h2>
                      <p>${player.archived ? "Archived" : "Active"}</p>
                    </div>
                    <div class="row-actions">
                      <button type="button" data-action="edit-player">Edit</button>
                      <button type="button" data-action="archive-player">${player.archived ? "Delete" : "Archive"}</button>
                    </div>
                  </article>
                `
              )
              .join("")
          : `<p class="empty">${escapeHtml(t(data.settings.language, "emptyPlayers"))}</p>`;
}
