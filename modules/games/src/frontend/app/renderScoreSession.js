import { getTotals, higherScoreLeads } from '../../backend/features/sessions.js';
import { testIds } from './testIds.js';
import { escapeHtml } from '../components/components.js';
import { renderRound } from './renderRound.js';

export function renderScoreSession(session, { readOnly = false } = {}) {
  const totals = getTotals(session);
  const higherLeads = higherScoreLeads(session);
  const ranked = [...session.participants].sort((a, b) => {
    const diff = (totals[b.playerId] || 0) - (totals[a.playerId] || 0);
    return higherLeads ? diff : -diff;
  });
  const overRoundCount =
    session.scoringMode === "highest_score_after_rounds" && session.roundCount && session.rounds.length > session.roundCount;
  return `
    <div class="totals-strip">
      ${ranked
        .map(
          (participant, index) => `
            <div class="total-pill ${index === 0 ? "leader" : ""}" data-testid="${testIds.sessionTotal}">
              <span class="total-rank">${index === 0 ? "Leader" : `Rank ${index + 1}`}</span>
              <strong>${totals[participant.playerId] || 0}</strong>
              <span class="total-name">${escapeHtml(participant.nameSnapshot)}</span>
            </div>
          `
        )
        .join("")}
    </div>
    ${overRoundCount ? `<p class="notice">This session is past the planned ${session.roundCount} rounds.</p>` : ""}
    <div class="round-list">
      ${session.rounds.map((round, index) => renderRound(session, round, index === session.rounds.length - 1, readOnly)).join("")}
    </div>
    ${readOnly ? "" : `<button type="button" data-testid="${testIds.addRound}" class="wide">Add round</button>`}
  `;
}
