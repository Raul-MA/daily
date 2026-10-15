import { testIds } from './testIds.js';
import { escapeHtml } from '../components/components.js';
import { scoringLabels } from '../../backend/features/games.js';
import { t } from '../../backend/core/i18n.js';

export function renderGameCatalog(data, games, active) {
 return games.length
          ? games
              .map(
                (game) => `
                  <article class="list-row ${game.archived ? "archived" : ""}" data-testid="${testIds.gameItem}" data-id="${escapeHtml(game.id)}">
                    <div>
                      <h2>${escapeHtml(game.name)}</h2>
                      <p>${escapeHtml(game.isCollaborative ? "Collaborative · shared win/loss" : scoringLabels[game.scoringMode])}${game.archived ? " - Archived" : ""}</p>
                    </div>
                    <div class="row-actions">
                      <button type="button" data-action="edit-game" ${active ? "disabled" : ""}>Edit</button>
                      <button type="button" data-action="archive-game" ${active ? "disabled" : ""}>${game.archived ? "Delete" : "Archive"}</button>
                    </div>
                  </article>
                `
              )
              .join("")
          : `<p class="empty">${escapeHtml(t(data.settings.language, "emptyGames"))}</p>`;
}
