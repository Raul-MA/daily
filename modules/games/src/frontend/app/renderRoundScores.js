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
                      <input data-testid="${testIds.scoreInput}" data-round-id="${escapeHtml(round.id)}" data-player-id="${escapeHtml(participant.playerId)}" type="text" inputmode="text" enterkeyhint="done" autocomplete="off" value="${escapeHtml(round.scores[participant.playerId] ?? 0)}">
                      <span class="score-preview" data-testid="${testIds.scorePreview}">${copy("Total: {value}", { value: escapeHtml(round.scores[participant.playerId] ?? 0) })}</span>
                    </label>`
              }
            `
          )
          .join("");
}
