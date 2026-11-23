import { categories } from './categories.js';
import { categoryTotal, completeCategories } from './scorecard.js';
import { wingspanCopy } from './copy.js';
import { escapeHtml } from '../../frontend/components/components.js';

export function renderWingspanSheet(session, { readOnly = false, language = 'en' } = {}) {
  const copy = text => wingspanCopy(language, text);
  return `<section class="wingspan-sheet" data-testid="wingspan-sheet">
    <h2>${copy('Wingspan score sheet')}</h2>
    <p class="subtle">${copy('Birds, bonuses and goals: enter points. Eggs, cached food and tucked cards: enter counts.')}</p>
    <div class="wingspan-players">${session.participants.map(participant => renderPlayer(session, participant, { readOnly, language })).join('')}</div>
    ${readOnly ? '' : `<p class="subtle">${copy('Enter all six categories for every player, including zeros.')}</p>`}
  </section>`;
}

function renderPlayer(session, participant, options) {
  const copy = text => wingspanCopy(options.language, text);
  const player = session.scorecard.players[participant.playerId];
  const name = escapeHtml(participant.nameSnapshot);
  return `<article class="ledger-block wingspan-player" data-testid="wingspan-player" data-player-id="${escapeHtml(participant.playerId)}">
    <h3>${name}</h3>
    <div class="wingspan-total-row"><span data-wingspan-total-label>${copy(completeCategories(session) ? 'Total' : 'Provisional total')}</span>
      <output data-testid="wingspan-total" aria-label="${copy('Total')} · ${name}" aria-live="polite">${categoryTotal(player)}</output></div>
    <div class="wingspan-fields">${categories.map(category => renderField({ participant, category: category.id, label: copy(category.label), value: player.categories[category.id], readOnly: options.readOnly })).join('')}</div>
    <div class="wingspan-tiebreak">${renderField({ participant, category: 'unusedFood', label: copy('Unused food'), value: player.unusedFood, readOnly: options.readOnly })}
      <small>${copy('Only breaks tied totals; no points.')}</small></div>
  </article>`;
}

function renderField({ participant, category, label, value, readOnly }) {
  if (readOnly) return `<div class="wingspan-field"><span>${label}</span><strong>${value ?? '—'}</strong></div>`;
  const id = `wingspan-${participant.playerId}-${category}`;
  const testId = category === 'unusedFood' ? 'wingspan-unused-food' : 'wingspan-category';
  return `<label class="wingspan-field" for="${escapeHtml(id)}"><span>${label}</span>
    <input id="${escapeHtml(id)}" name="${escapeHtml(id)}" data-testid="${testId}" data-player-id="${escapeHtml(participant.playerId)}" data-category="${category}"
      aria-label="${escapeHtml(participant.nameSnapshot)} · ${label}" type="number" inputmode="numeric" min="0" max="9007199254740991" step="1" value="${value ?? ''}"></label>`;
}
