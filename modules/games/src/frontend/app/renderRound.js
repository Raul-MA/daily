import { testIds } from './testIds.js';
import { escapeHtml } from '../components/components.js';
import { getRoundSummary } from './getRoundSummary.js';
import { renderRoundScores } from './renderRoundScores.js';

export function renderRound(session, round, expanded, readOnly = false) {
  return `
    <details class="round-card" ${expanded || readOnly ? "open" : ""}${readOnly ? ` data-testid="${testIds.gameDetailRound}"` : ""}>
      <summary>
        <span class="round-title">Round ${round.roundNumber}</span>
        <span class="round-summary">${escapeHtml(getRoundSummary(session, round))}</span>
        ${
          readOnly
            ? ""
            : `<button class="danger-button" type="button" data-action="remove-round" data-round-id="${escapeHtml(round.id)}" aria-label="Remove round ${round.roundNumber}">Remove</button>`
        }
      </summary>
      <div class="score-grid">
        ${renderRoundScores(session, round, readOnly)}
      </div>
    </details>
  `;
}
