import { copy } from './copy.js';
import { getActiveSession } from '../../backend/features/sessions.js';
import { testIds } from './testIds.js';
import { escapeHtml } from '../components/components.js';
import { scoringLabels } from '../../backend/features/games.js';
import { t } from '../../backend/core/i18n.js';
import { renderSessionTiming } from './renderSessionTiming.js';
import { renderSessionBody } from './renderSessionBody.js';

export function renderActiveSession(data) {
  const session = getActiveSession(data);
  if (!session) {
    return `
      <section class="view-header">
        <p>${copy("Session")}</p>
        <h1>${copy("No active session")}</h1>
      </section>
      <button class="primary" type="button" data-action="go-play">${copy("Start a game")}</button>
    `;
  }
  return `
    <section class="session-view" data-testid="${testIds.activeSession}">
      <header class="session-top">
        <div>
          <p>${escapeHtml(session.isCollaborative ? copy("Collaborative") : copy(scoringLabels[session.scoringMode]) || copy("Session"))}</p>
          <h1>${escapeHtml(session.gameNameSnapshot)}</h1>
        </div>
        <button class="primary" data-testid="${testIds.finishSession}" type="button">${escapeHtml(t(data.settings.language, "finish"))}</button>
      </header>
      ${renderSessionTiming(session)}
      ${
        renderSessionBody(session, false)
      }
    </section>
  `;
}
