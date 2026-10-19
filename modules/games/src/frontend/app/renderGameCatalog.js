import { copy } from './copy.js';
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
                      <p>${escapeHtml(game.isCollaborative ? copy("Collaborative · shared win/loss") : copy(scoringLabels[game.scoringMode]))}${game.archived ? copy(" - Archived") : ""}</p>
                    </div>
                    <div class="row-actions">
                      <button type="button" data-action="edit-game" ${active ? "disabled" : ""}>${copy("Edit")}</button>
                      <button type="button" data-action="archive-game" ${active ? "disabled" : ""}>${game.archived ? copy("Delete") : copy("Archive")}</button>
                    </div>
                  </article>
                `
              )
              .join("")
          : `<p class="empty">${escapeHtml(t(data.settings.language, "emptyGames"))}</p>`;
}
