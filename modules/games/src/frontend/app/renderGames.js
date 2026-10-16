import { copy } from './copy.js';
import { gameUI } from './context.js';
import { visibleItems } from './visibleItems.js';
import { getActiveSession } from '../../backend/features/sessions.js';
import { renderGameEditor } from './renderGameEditor.js';
import { renderGameCatalog } from './renderGameCatalog.js';

export function renderGames(data) {
  const current = data.games.find((game) => game.id === gameUI.ui.editingGameId);
  const games = visibleItems(data.games, data.settings.showArchived);
  const active = getActiveSession(data);
  const draft = gameUI.ui.gameFormDraft || {};
  const mode = gameUI.ui.gameFormMode || current?.scoringMode || "highest_score_after_rounds";
  const isCollaborative =
    draft.isCollaborative !== undefined ? ["on", "true"].includes(draft.isCollaborative) : Boolean(current?.isCollaborative);
  return `
    <section class="view-header">
      <p>${copy("Games")}</p>
      <h1>${copy("Scoring rules")}</h1>
    </section>
    ${
      renderGameEditor({ data, current, active, draft, mode, isCollaborative })
    }
    <section class="list">
      ${
        renderGameCatalog(data, games, active)
      }
    </section>
  `;
}
