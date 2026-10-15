import { renderCollaborativeOutcomeContent1 } from './renderCollaborativeOutcomeContent1.js';

export function renderCollaborativeOutcome(session, { readOnly = false } = {}) {
  return `
    <section class="ledger-block collaborative-result">
      <div class="section-heading">
        <span>Whole table</span>
        <h2>Team result</h2>
      </div>
      ${
        renderCollaborativeOutcomeContent1(session, readOnly)
      }
    </section>
  `;
}
