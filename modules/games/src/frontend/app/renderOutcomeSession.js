import { renderOutcomeSessionContent1 } from './renderOutcomeSessionContent1.js';

export function renderOutcomeSession(session, { readOnly = false } = {}) {
  return `
    <div class="outcome-list">
      ${renderOutcomeSessionContent1(session, readOnly)}
    </div>
  `;
}
