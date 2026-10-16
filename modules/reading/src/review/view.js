import { readerError } from '../ui/i18n.js';
import { href } from '../../../../packages/platform/src/router.js';
import { element } from '../ui/cards.js';
import { mountReviewCards } from './cards.js';
import { createReviewPresentation } from './presentation.js';

function link(text, url, marker) {
  const node = element('a', 'secondary-button', text);
  node.href = url;
  if (marker) node.setAttribute(marker, '');
  return node;
}
function message(snapshot, spanish) {
  const messages = {
    idle: ['Open Readwise or refresh the latest review.', 'Abre Readwise o actualiza el último repaso.'],
    credentials: ['Add your token in Reader settings, or open Readwise.', 'Añade tu token en Reader o abre Readwise.'],
    loading: ['Loading the latest review…', 'Cargando el último repaso…'],
    empty: ['No scheduled review is available.', 'No hay ningún repaso disponible.'],
    completing: ['Waiting for Readwise completion confirmation…', 'Esperando la confirmación de Readwise…'],
  };
  if (snapshot.status === 'error') return cachedError(snapshot, spanish);
  if (snapshot.status === 'ready') return fetched(snapshot, spanish);
  return (messages[snapshot.status] ?? messages.idle)[spanish ? 1 : 0];
}
function fetched(snapshot, spanish) {
  const label = spanish ? 'Última consulta' : 'Last fetched';
  const cached = spanish ? ' · En caché' : ' · Cached';
  return `${label}: ${new Date(snapshot.fetchedAt).toLocaleString(spanish ? 'es' : 'en')}${snapshot.cached ? cached : ''}`;
}
function cachedError(snapshot, spanish) {
  const text = readerError(spanish ? 'es' : 'en', { message: snapshot.error, status: snapshot.errorStatus, retryAfterSeconds: snapshot.retryAfterSeconds });
  if (!snapshot.cached) return text;
  const label = spanish ? 'Repaso en caché' : 'Cached review';
  return `${text} · ${label} · ${new Date(snapshot.fetchedAt).toLocaleString(spanish ? 'es' : 'en')}`;
}
function feedback(context, node, snapshot) {
  if (!snapshot.value) return;
  node.append(element('p', 'summary', context.spanish ? 'Mostrar este subrayado de nuevo. Elige el plazo en Readwise.' : 'Show this highlight again. Choose the timing in Readwise.'));
  const labels = context.spanish ? ['Nunca', 'Pronto', 'Más tarde', 'Algún día'] : ['Never', 'Soon', 'Later', 'Someday'];
  for (const [index, action] of ['never', 'soon', 'later', 'someday'].entries()) {
    const handoff = context.review.feedback(action);
    const target = link(labels[index], handoff.url, 'data-review-feedback');
    target.setAttribute('aria-label', `${labels[index]} — ${context.spanish ? 'elegir en Readwise' : 'choose in Readwise'}`);
    node.append(target);
  }
}
function controls(context, snapshot, host) {
  const form = element('form', 'review-actions');
  form.id = 'review-actions';
  form.dataset.unsaved = String(snapshot.status === 'completing');
  const button = element('button', 'primary-button', context.spanish ? 'Marcar repaso completado' : 'Mark review complete');
  button.type = 'button';
  button.disabled = snapshot.status !== 'ready' || !snapshot.value || snapshot.value.completed;
  button.addEventListener('click', () => context.review.complete().catch(error => report(context, error)));
  form.append(button);
  host.append(form);
  if (snapshot.value?.completed) {
    const done = element('p', 'status success', context.spanish ? 'Repaso completado en Readwise.' : 'Review completed in Readwise.');
    done.dataset.reviewCompleted = '';
    host.append(done);
  }
  document.dispatchEvent(new Event('daily:form-state'));
}
function report(context, error) {
  if (context.disposed) return;
  if (context.review.snapshot().status === 'error') render(context);
  else context.host.querySelector('[data-review-status]').textContent = readerError(context.spanish ? 'es' : 'en', error);
}
function render(context) {
  const snapshot = context.review.snapshot();
  const host = context.content;
  host.replaceChildren();
  const status = element('p', 'status', message(snapshot, context.spanish));
  status.dataset.reviewStatus = '';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  host.append(status, link(context.spanish ? 'Abrir repaso en Readwise' : 'Open Daily Review in Readwise', snapshot.url, 'data-review-direct'));
  if (snapshot.value) showCards(context, snapshot, host);
  feedback(context, host, snapshot);
  controls(context, snapshot, host);
}
function showCards(context, snapshot, host) {
  if (context.ui.reviewId !== snapshot.value.id) {
    context.ui.reviewId = snapshot.value.id;
    context.ui.presentation = createReviewPresentation(snapshot.value.highlights, { qa: false });
  }
  const cards = element('div', 'review-cards');
  host.append(cards);
  mountReviewCards(cards, snapshot.value.highlights, { presentation: context.ui.presentation, language: context.spanish ? 'es' : 'en' });
}
export function mountReview(options) {
  const host = element('section', 'reader-shell');
  host.dataset.module = 'reading';
  const context = { ...options, host, spanish: document.documentElement.lang === 'es', review: options.service.review, content: element('div', 'review-content'), disposed: false };
  const heading = element('h1', '', context.spanish ? 'Último repaso disponible' : 'Latest available review');
  heading.dataset.reviewHeading = '';
  heading.tabIndex = -1;
  const refresh = element('button', 'secondary-button', context.spanish ? 'Actualizar repaso' : 'Refresh review');
  refresh.type = 'button';
  refresh.addEventListener('click', () => context.review.refresh().catch(error => report(context, error)));
  host.append(heading, link('Reader Picker', href({ page: 'reader' }, options.base)), refresh, context.content);
  const stop = options.service.subscribe(() => render(context));
  render(context);
  if (!options.ui.reviewMounted && !['loading', 'completing'].includes(context.review.snapshot().status)) {
    queueMicrotask(() => context.review.refresh().catch(error => report(context, error)));
  }
  options.ui.reviewMounted = true;
  return { node: host, dispose: () => { context.disposed = true; stop(); } };
}
