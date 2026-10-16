import { copy } from './copy.js';
import { renderCollaborativeOutcomeContent1 } from './renderCollaborativeOutcomeContent1.js';

export function renderCollaborativeOutcome(session, { readOnly = false } = {}) {
  return `
    <section class="ledger-block collaborative-result">
      <div class="section-heading">
        <span>${copy("Whole table")}</span>
        <h2>${copy("Team result")}</h2>
      </div>
      ${
        renderCollaborativeOutcomeContent1(session, readOnly)
      }
    </section>
  `;
}
