import { renderScoreInput } from '../components/score-input.js';
import { copy } from './copy.js';
import { testIds } from './testIds.js';
import { escapeHtml } from '../components/components.js';

export function renderRoundScores(session, round, readOnly) {
 return session.participants
          .map(
            (participant) => `
              ${
                readOnly
                  ? `<div class="score-readout" data-testid="${testIds.gameDetailScore}">
                      <span>${escapeHtml(participant.nameSnapshot)}</span>
                      <strong>${escapeHtml(round.scores[participant.playerId] ?? 0)}</strong>
                    </div>`
                  : `<label>
                      ${escapeHtml(participant.nameSnapshot)}
                      ${renderScoreInput({ value: round.scores[participant.playerId] ?? 0, attributes: { 'data-testid': testIds.scoreInput, 'data-round-id': round.id, 'data-player-id': participant.playerId }, preview: copy('Total: {value}', { value: round.scores[participant.playerId] ?? 0 }) })}
                    </label>`
              }
            `
          )
          .join("");
}
