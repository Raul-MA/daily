import { playerDisplayName } from './playerDisplayName.js';
import { formatOutcome } from './formatOutcome.js';
import { getTotals, getDurationMinutes } from '../../backend/features/sessions.js';
import { testIds } from './testIds.js';
import { escapeHtml } from '../components/components.js';
import { formatDate } from './formatDate.js';
import { formatDuration } from './formatDuration.js';
import { renderHistoryItemContent1 } from './renderHistoryItemContent1.js';

export function renderHistoryItem(data, session) {
  const winnerNames = session.winnerPlayerIds.map((id) => playerDisplayName(data, session, id)).join(", ") || "No winner";
  const resultLabel = session.isCollaborative
    ? `Team result: ${formatOutcome(session.collaborativeOutcome)}`
    : `Winner: ${winnerNames}`;
  const totals = getTotals(session);
  return `
    <article class="list-row clickable-row" data-testid="${testIds.historyItem}" data-id="${escapeHtml(session.id)}">
      <div class="history-main">
        <div class="history-title-row">
          <h2>${escapeHtml(session.gameNameSnapshot)}</h2>
          <span>${formatDate(session.completedAt)}</span>
        </div>
        <p class="history-winner">${escapeHtml(resultLabel)}</p>
        <p data-testid="${testIds.historyDuration}">Duration: ${escapeHtml(formatDuration(getDurationMinutes(session)))}</p>
        ${
          renderHistoryItemContent1(data, session, totals)
        }
      </div>
      <div class="row-actions">
        <button type="button" data-action="view-session">View</button>
        <button type="button" data-action="edit-session">Edit</button>
        <button type="button" data-action="delete-session">Delete</button>
      </div>
    </article>
  `;
}
