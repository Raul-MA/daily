import { copy } from './copy.js';
import { testIds } from './testIds.js';
import { escapeHtml } from '../components/components.js';
import { getRoundSummary } from './getRoundSummary.js';
import { renderRoundScores } from './renderRoundScores.js';

export function renderRound(session, round, expanded, readOnly = false) {
  return `
    <details class="round-card" ${expanded || readOnly ? "open" : ""}${readOnly ? ` data-testid="${testIds.gameDetailRound}"` : ""}>
      <summary>
        <span class="round-title">${copy("Round {number}", { number: round.roundNumber })}</span>
        <span class="round-summary">${escapeHtml(getRoundSummary(session, round))}</span>
        ${
          readOnly
            ? ""
            : `<button class="danger-button" type="button" data-action="remove-round" data-round-id="${escapeHtml(round.id)}" aria-label="${copy("Remove round {number}", { number: round.roundNumber })}">${copy("Remove")}</button>`
        }
      </summary>
      <div class="score-grid">
        ${renderRoundScores(session, round, readOnly)}
      </div>
    </details>
  `;
}
