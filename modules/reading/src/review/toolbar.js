import { element } from '../ui/cards.js';

function button(text, action) {
  const node = element('button', 'secondary-button', text);
  node.type = 'button';
  node.addEventListener('click', action);
  return node;
}
function handoff(label, icon, url, spanish) {
  const node = element('a', 'review-tool');
  node.href = url;
  node.setAttribute('aria-label', `${label} — ${spanish ? 'abrir en Readwise' : 'open in Readwise'}`);
  node.title = spanish ? 'Abrir en Readwise' : 'Open in Readwise';
  const symbol = element('span', 'review-tool-icon', icon);
  symbol.setAttribute('aria-hidden', 'true');
  node.append(symbol, element('span', '', label));
  return node;
}
export function reviewProgress(presentation, spanish) {
  const { index, total } = presentation.position();
  const host = element('div', 'review-progress');
  host.dataset.reviewProgress = '';
  host.tabIndex = -1;
  host.setAttribute('role', 'status');
  host.append(element('span', '', `${Math.min(index + 1, total)} ${spanish ? 'de' : 'of'} ${total}`));
  const dots = element('span', 'review-dots');
  dots.setAttribute('aria-hidden', 'true');
  for (let position = 0; position < Math.min(total, 30); position++) {
    const dot = element('span', position === index ? 'current' : '');
    dots.append(dot);
  }
  host.append(dots);
  return host;
}
function isLast(presentation) {
  if (!presentation) return true;
  const { index, total } = presentation.position();
  return index >= total - 1;
}
function unavailable(snapshot) {
  return snapshot.status !== 'ready' || !snapshot.value || snapshot.value.completed;
}
export function reviewToolbar(context, snapshot, actions) {
  const form = element('form', 'review-actions');
  form.id = 'review-actions';
  form.dataset.unsaved = String(snapshot.status === 'completing');
  const spanish = context.spanish;
  const labels = spanish ? ['Descartar', 'Dominar', 'Frecuencia'] : ['Discard', 'Master', 'Frequency'];
  for (const [index, icon] of ['×', '◇', '◷'].entries()) form.append(handoff(labels[index], icon, snapshot.url, spanish));
  const last = isLast(context.ui.presentation);
  const done = button(spanish ? 'Listo' : 'Done', () => {
    if (last) actions.complete();
    else { context.ui.presentation.next(); actions.change(); }
  });
  done.className = 'primary-button review-done';
  if (last) done.setAttribute('aria-label', spanish ? 'Marcar repaso completado' : 'Mark review complete');
  done.disabled = unavailable(snapshot);
  form.append(done);
  return form;
}
export function reviewPrevious(context, change) {
  const previous = button(context.spanish ? 'Tarjeta anterior' : 'Previous card', () => {
    context.ui.presentation.previous();
    change();
  });
  previous.setAttribute('aria-label', previous.textContent);
  previous.title = previous.textContent;
  previous.textContent = '←';
  previous.className = 'secondary-button review-previous';
  previous.disabled = context.ui.presentation.position().index === 0;
  return previous;
}
