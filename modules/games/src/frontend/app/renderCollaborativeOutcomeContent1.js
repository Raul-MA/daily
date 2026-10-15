import { testIds } from './testIds.js';
import { escapeHtml, option } from '../components/components.js';
import { formatOutcome } from './formatOutcome.js';

export function renderCollaborativeOutcomeContent1(session, readOnly) {
 return readOnly
          ? `<strong class="team-result ${session.collaborativeOutcome || "pending"}" data-testid="${testIds.collaborativeOutcome}">
              ${escapeHtml(formatOutcome(session.collaborativeOutcome))}
            </strong>`
          : `<label>
              Result
              <select data-testid="${testIds.collaborativeOutcome}">
                ${option("", "Choose team result", session.collaborativeOutcome)}
                ${option("win", "Win", session.collaborativeOutcome)}
                ${option("loss", "Loss", session.collaborativeOutcome)}
              </select>
            </label>`;
}
