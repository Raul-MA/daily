import { escapeHtml, option } from '../components/components.js';
import { testIds } from './testIds.js';
import { formatOutcome } from './formatOutcome.js';

export function renderOutcomeSessionContent1(session, readOnly) {
 return session.results
        .map((result) => {
          const participant = session.participants.find((item) => item.playerId === result.playerId);
          return `
            <label class="outcome-row">
              <span>${escapeHtml(participant?.nameSnapshot || "Player")}</span>
              ${
                readOnly
                  ? `<strong class="outcome-readout" data-testid="${testIds.gameDetailOutcome}">${escapeHtml(formatOutcome(result.outcome))}</strong>`
                  : `<select data-testid="${testIds.outcomeSelect}" data-player-id="${escapeHtml(result.playerId)}">
                      ${option("", "Choose result", result.outcome)}
                      ${option("win", "Win", result.outcome)}
                      ${option("loss", "Loss", result.outcome)}
                      ${option("tie", "Tie", result.outcome)}
                    </select>`
              }
            </label>
          `;
        })
        .join("");
}
