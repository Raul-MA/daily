import { element } from '../ui/cards.js';
import { readerError } from '../ui/i18n.js';
import { widgetButton, widgetStatus } from '../widget-ui.js';
import { reviewWidgetCards } from './widget-cards.js';

function dateNote(spanish) {
  return element('p', 'reading-detail', spanish ? 'Fecha sin verificar. Readwise no indica la fecha de este repaso.' : 'Date unverified. Readwise does not provide this review’s date.');
}

function pendingStatus(host, snapshot, spanish) {
  if (snapshot.status === 'completing') host.append(widgetStatus(spanish ? 'Completando el repaso…' : 'Completing review…'));
  if (snapshot.value && snapshot.status === 'loading') host.append(widgetStatus(spanish ? 'Actualizando el repaso…' : 'Refreshing review…'));
}

function supplementary(host, service, language, snapshot) {
  const spanish = language === 'es';
  if (snapshot.status === 'error') host.append(widgetStatus(readerError(language, { message: snapshot.error, status: snapshot.errorStatus, retryAfterSeconds: snapshot.retryAfterSeconds }), true));
  pendingStatus(host, snapshot, spanish);
  if (!service.token()) return;
  const refresh = widgetButton(spanish ? 'Actualizar' : 'Refresh', 'review-refresh', () => service.review.refresh().catch(() => undefined));
  refresh.classList.add('reading-widget-refresh');
  refresh.disabled = ['loading', 'completing'].includes(snapshot.status);
  host.append(refresh);
}

export function reviewWidget(service, language) {
  const host = element('div', 'reading-review-widget reading-dashboard');
  host.dataset.readingReview = '';
  const spanish = language === 'es';
  function render(focus = false) {
    host.replaceChildren();
    const snapshot = service.review.snapshot();
    const value = snapshot.value;
    if (value) {
      host.append(element('p', 'reading-section-title', spanish ? 'Último repaso disponible' : 'Latest available review'));
      if (value.day === null) host.append(dateNote(spanish));
      const navigation = service.review.navigation.read(value);
      reviewWidgetCards({ host, review: service.review, snapshot, value, navigation, spanish, redraw: render });
    } else host.append(widgetStatus(widgetText(snapshot, spanish)));
    supplementary(host, service, language, snapshot);
    if (focus) host.querySelector('[data-review-progress]')?.focus({ preventScroll: true });
  }
  render();
  queueMicrotask(() => { if (host.isConnected) service.review.ensure().catch(() => undefined); });
  return host;
}

function widgetText(snapshot, spanish) {
  const en = { idle: 'Connect Readwise in Reader settings to load your review.', credentials: 'Connect Readwise in Reader settings to load your review.', loading: 'Loading your review…' };
  const es = { idle: 'Conecta Readwise en los ajustes de Reader para cargar tu repaso.', credentials: 'Conecta Readwise en los ajustes de Reader para cargar tu repaso.', loading: 'Cargando tu repaso…' };
  const messages = spanish ? es : en;
  return messages[snapshot.status] ?? (spanish ? 'No hay ningún repaso programado disponible.' : 'No scheduled review is available.');
}
