import { element } from '../ui/cards.js';
import { widgetButton, widgetStatus } from '../widget-ui.js';

function move(context, index) {
  savePosition(context, index, context.navigation.revisiting);
}

function savePosition(context, index, revisiting) {
  const { review, value, redraw, spanish, host } = context;
  const saved = review.navigation.save(value, index, revisiting);
  redraw(true);
  if (!saved) host.append(widgetStatus(spanish ? 'No se pudo guardar la posición. Se perderá al recargar.' : 'Your position could not be saved. It will reset after reloading.', true));
}

function controls(context) {
  const { value, navigation, spanish, snapshot } = context;
  const total = value.highlights.length;
  const bar = element('div', 'reading-review-controls');
  const previous = widgetButton(spanish ? 'Anterior' : 'Previous', 'review-previous', () => move(context, navigation.index - 1));
  previous.disabled = navigation.index === 0 || snapshot.status === 'completing';
  bar.append(previous);
  if (navigation.index < total - 1) bar.append(widgetButton(spanish ? 'Siguiente' : 'Next', 'review-next', () => move(context, navigation.index + 1)));
  else if (!value.completed) {
    const complete = widgetButton(spanish ? 'Completar repaso' : 'Complete review', 'review-complete', () => context.review.complete().catch(() => undefined));
    complete.classList.add('reading-widget-primary');
    complete.disabled = snapshot.status === 'completing';
    bar.append(complete);
  }
  return bar;
}

function completed(context) {
  const { host, value, spanish, navigation } = context;
  if (value.completed && !navigation.revisiting) {
    host.append(element('p', 'reading-complete', spanish ? 'Repaso completado' : 'Review complete'));
    host.append(widgetButton(spanish ? 'Volver a ver los subrayados' : 'Revisit highlights', 'review-revisit', () => savePosition(context, 0, true)));
    return true;
  }
  return false;
}

function highlightCard(current) {
  const card = element('div', 'daily-review-card');
  card.dataset.reviewCard = '';
  if (current.title) card.append(element('h3', 'daily-review-source', current.title));
  if (current.author) card.append(element('p', 'reading-detail', current.author));
  card.append(element('blockquote', 'daily-review-quote', current.text));
  return card;
}

export function reviewWidgetCards(context) {
  const { host, value, spanish, navigation } = context;
  if (completed(context)) return;
  const current = value.highlights[navigation.index];
  if (!current) { host.append(widgetStatus(spanish ? 'Este repaso no contiene subrayados.' : 'This review has no highlights.')); return; }
  if (value.completed) host.append(element('p', 'reading-complete', spanish ? 'Repaso completado' : 'Review complete'));
  host.append(highlightCard(current));
  const label = `${navigation.index + 1} ${spanish ? 'de' : 'of'} ${value.highlights.length}`;
  const progress = element('p', 'reading-review-progress', label);
  progress.dataset.reviewProgress = '';
  progress.tabIndex = -1;
  progress.setAttribute('aria-label', spanish ? `Subrayado ${progress.textContent}` : `Highlight ${progress.textContent}`);
  host.append(progress, controls(context));
}
