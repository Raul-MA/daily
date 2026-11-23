import { evaluateScoreExpression } from '../../frontend/app/evaluateScoreExpression.js';
import { updateScorePreview } from '../../frontend/app/updateScorePreview.js';
import { categoryTotal } from './scorecard.js';
import { validCategoryValue } from './validation.js';
import { wingspanCopy } from './copy.js';

export function readWingspanEntries(root) {
  return [...root.querySelectorAll('[data-testid="wingspan-sheet"] [data-category]')].map(input => ({
    playerId: input.dataset.playerId, category: input.dataset.category,
    value: inputValue(input)
  }));
}

function inputValue(input) {
  if (!input.value.trim()) return null;
  const evaluated = evaluateScoreExpression(input.value);
  return evaluated.valid ? evaluated.value : NaN;
}

export function bindWingspanInputs(root, { guard, commit, language }) {
  root.querySelectorAll('[data-category]').forEach(input => {
    input.addEventListener('input', () => {
      refreshWingspanPreview(root, language);
    });
    input.addEventListener('keydown', guard(event => {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      if (commit()) refreshWingspanPreview(root, language);
    }));
    input.addEventListener('change', guard(() => {
      if (commit()) refreshWingspanPreview(root, language);
    }));
  });
}

export function refreshWingspanPreview(root, language) {
  const entries = readWingspanEntries(root);
  for (const input of root.querySelectorAll('[data-category]')) {
    const value = inputValue(input);
    updateScorePreview(input, { valid: validCategoryValue(value), value: value ?? '—' });
  }
  if (!entries.length || entries.some(entry => !validCategoryValue(entry.value))) return;
  const complete = entries.filter(entry => entry.category !== 'unusedFood').every(entry => entry.value !== null);
  for (const article of root.querySelectorAll('[data-testid="wingspan-player"]')) {
    const playerEntries = entries.filter(entry => entry.playerId === article.dataset.playerId);
    const player = { categories: Object.fromEntries(playerEntries.map(entry => [entry.category, entry.value])) };
    article.querySelector('[data-testid="wingspan-total"]').textContent = categoryTotal(player);
    article.querySelector('[data-wingspan-total-label]').textContent = wingspanCopy(language, complete ? 'Total' : 'Provisional total');
  }
}

export function normalizeWingspanInputs(root) {
  for (const input of root.querySelectorAll('[data-category]')) input.value = inputValue(input) ?? '';
}
