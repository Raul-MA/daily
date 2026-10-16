import { copy } from './copy.js';
import { testIds } from './testIds.js';
import { escapeHtml, option } from '../components/components.js';
import { formatOutcome } from './formatOutcome.js';

export function renderCollaborativeOutcomeContent1(session, readOnly) {
 return readOnly
          ? `<strong class="team-result ${session.collaborativeOutcome || "pending"}" data-testid="${testIds.collaborativeOutcome}">
              ${escapeHtml(formatOutcome(session.collaborativeOutcome))}
            </strong>`
          : `<label>
              ${copy("Result")}
              <select data-testid="${testIds.collaborativeOutcome}">
                ${option("", copy("Choose team result"), session.collaborativeOutcome)}
                ${option("win", copy("Win"), session.collaborativeOutcome)}
                ${option("loss", copy("Loss"), session.collaborativeOutcome)}
              </select>
            </label>`;
}
