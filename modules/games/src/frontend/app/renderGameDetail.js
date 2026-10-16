import { copy } from './copy.js';
import { playerDisplayName } from './playerDisplayName.js';
import { formatOutcome } from './formatOutcome.js';
import { testIds } from './testIds.js';
import { escapeHtml } from '../components/components.js';
import { scoringLabels } from '../../backend/features/games.js';
import { formatDate } from './formatDate.js';
import { formatDuration } from './formatDuration.js';
import { getDurationMinutes } from '../../backend/features/sessions.js';
import { renderSessionBody } from './renderSessionBody.js';

export function renderGameDetail(data, sessionId) {
  const session = data.sessions.find((item) => item.id === sessionId && item.status === "completed");
  if (!session) {
    return `
      <section class="view-header">
        <p>${copy("Game details")}</p>
        <h1>${copy("Game not found")}</h1>
      </section>
      <button type="button" data-action="back-history">${copy("Back to history")}</button>
    `;
  }
  const winnerNames = session.winnerPlayerIds.map((id) => playerDisplayName(data, session, id)).join(", ") || copy("No winner");
  const resultHeading = session.isCollaborative
    ? copy("Team result: {result}", { result: formatOutcome(session.collaborativeOutcome) })
    : copy("Winner: {name}", { name: winnerNames });
  return `
    <section class="session-view game-detail" data-testid="${testIds.gameDetail}" data-id="${escapeHtml(session.id)}">
      <header class="session-top">
        <div>
          <p>${escapeHtml(session.isCollaborative ? copy("Collaborative") : copy(scoringLabels[session.scoringMode]) || copy("Game details"))}</p>
          <h1>${escapeHtml(session.gameNameSnapshot)}</h1>
        </div>
        <div class="row-actions">
          <button type="button" data-action="back-history">${copy("Back")}</button>
          <button class="primary" type="button" data-action="edit-session" data-id="${escapeHtml(session.id)}">${copy("Edit")}</button>
        </div>
      </header>
      <section class="ledger-block detail-summary">
        <div class="section-heading">
          <span>${copy("Result")}</span>
          <h2>${escapeHtml(resultHeading)}</h2>
        </div>
        <dl class="stat-facts">
          <div>
            <dt>${copy("Date")}</dt>
            <dd>${escapeHtml(formatDate(session.completedAt))}</dd>
          </div>
          <div>
            <dt>${copy("Duration")}</dt>
            <dd>${escapeHtml(formatDuration(getDurationMinutes(session)))}</dd>
          </div>
          <div>
            <dt>${copy("Players")}</dt>
            <dd>${session.participants.length}</dd>
          </div>
          ${session.roundCount ? `<div><dt>${copy("Planned rounds")}</dt><dd>${escapeHtml(session.roundCount)}</dd></div>` : ""}
          ${session.targetScore ? `<div><dt>${copy("Target")}</dt><dd>${escapeHtml(session.targetScore)}</dd></div>` : ""}
        </dl>
      </section>
      ${
        renderSessionBody(session, true)
      }
    </section>
  `;
}
