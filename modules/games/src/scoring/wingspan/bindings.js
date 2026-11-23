import { completeCategories, categoryTotal, setCategory }  from './scorecard.js';
import { wingspanCopy } from './copy.js';

export function bindWingspanInputs(root, { guard, commit, preview, language }) {
  root.querySelectorAll('[data-category]').forEach(input => {
    input.addEventListener('input', () => {
      input.setAttribute('aria-invalid', String(!input.validity.valid));
      if (input.validity.valid) refreshWingspanTotals(root, preview(input, setCategory), language);
    });
    input.addEventListener('change', guard(() => {
      const session = commit(input);
      if (session) refreshWingspanTotals(root, session, language);
    }));
  });
}

export function refreshWingspanTotals(root, session, language) {
  for (const article of root.querySelectorAll('[data-testid="wingspan-player"]')) {
    const player = session.scorecard.players[article.dataset.playerId];
    const total = categoryTotal(player);
    article.querySelector('[data-testid="wingspan-total"]').textContent = total;
    article.querySelector('[data-wingspan-total-label]').textContent = wingspanCopy(language, completeCategories(session) ? 'Total' : 'Provisional total');
  }
}
