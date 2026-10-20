import { createReviewPresentation } from './presentation.js';
import { element } from '../ui/cards.js';

function button(text, action) {
  const node = element('button', 'secondary-button', text);
  node.type = 'button';
  node.addEventListener('click', action);
  return node;
}
export function mountReviewCards(host, cards, options = {}) {
  const presentation = options.presentation ?? createReviewPresentation(cards, options);
  const spanish = options.language === 'es';
  function render(focus = false) {
    host.replaceChildren();
    const current = presentation.current();
    if (!current) { host.append(element('p', 'summary', spanish ? 'Ya has visto todas las tarjetas.' : 'All cards shown.')); return; }
    const card = element('section', 'result-card');
    card.dataset.reviewCard = '';
    if (current.kind === 'qa') question(card, current, focus);
    else card.append(element('p', 'review-source', `${current.title} · ${current.author}`), element('blockquote', '', current.text));
    host.append(card);
    if (options.navigation === false) return;
    host.append(button(spanish ? 'Tarjeta anterior' : 'Previous card', () => { presentation.previous(); render(); }), button(spanish ? 'Siguiente tarjeta' : 'Next card', () => { presentation.next(); render(); }));
  }
  function question(card, current, focus) {
    card.append(element('h2', '', current.question));
    if (current.revealed) {
      const answer = element('div', 'review-answer', current.answer);
      answer.dataset.reviewAnswer = '';
      answer.tabIndex = -1;
      answer.setAttribute('role', 'region');
      answer.setAttribute('aria-label', spanish ? 'Respuesta' : 'Answer');
      answer.setAttribute('aria-live', 'polite');
      card.append(answer);
      if (focus) queueMicrotask(() => answer.focus());
    } else card.append(button(spanish ? 'Mostrar respuesta' : 'Reveal answer', () => { presentation.reveal(); render(true); }));
  }
  render();
  return presentation;
}
