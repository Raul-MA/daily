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
        <p>Game details</p>
        <h1>Game not found</h1>
      </section>
      <button type="button" data-action="back-history">Back to history</button>
    `;
  }
  const winnerNames = session.winnerPlayerIds.map((id) => playerDisplayName(data, session, id)).join(", ") || "No winner";
  const resultHeading = session.isCollaborative
    ? `Team result: ${formatOutcome(session.collaborativeOutcome)}`
    : `Winner: ${winnerNames}`;
  return `
    <section class="session-view game-detail" data-testid="${testIds.gameDetail}" data-id="${escapeHtml(session.id)}">
      <header class="session-top">
        <div>
          <p>${escapeHtml(session.isCollaborative ? "Collaborative" : scoringLabels[session.scoringMode] || "Game details")}</p>
          <h1>${escapeHtml(session.gameNameSnapshot)}</h1>
        </div>
        <div class="row-actions">
          <button type="button" data-action="back-history">Back</button>
          <button class="primary" type="button" data-action="edit-session" data-id="${escapeHtml(session.id)}">Edit</button>
        </div>
      </header>
      <section class="ledger-block detail-summary">
        <div class="section-heading">
          <span>Result</span>
          <h2>${escapeHtml(resultHeading)}</h2>
        </div>
        <dl class="stat-facts">
          <div>
            <dt>Date</dt>
            <dd>${escapeHtml(formatDate(session.completedAt))}</dd>
          </div>
          <div>
            <dt>Duration</dt>
            <dd>${escapeHtml(formatDuration(getDurationMinutes(session)))}</dd>
          </div>
          <div>
            <dt>Players</dt>
            <dd>${session.participants.length}</dd>
          </div>
          ${session.roundCount ? `<div><dt>Planned rounds</dt><dd>${escapeHtml(session.roundCount)}</dd></div>` : ""}
          ${session.targetScore ? `<div><dt>Target</dt><dd>${escapeHtml(session.targetScore)}</dd></div>` : ""}
        </dl>
      </section>
      ${
        renderSessionBody(session, true)
      }
    </section>
  `;
}
