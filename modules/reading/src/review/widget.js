import { element } from '../ui/cards.js';

export function reviewWidget(service, language) {
  const host = element('div', 'reading-review-widget');
  host.dataset.readingReview = '';
  const snapshot = service.review.snapshot();
  const spanish = language === 'es';
  const text = widgetText(snapshot, spanish);
  host.append(element('p', 'widget-note', text));
  if (snapshot.value) host.append(element('p', 'widget-note', freshness(snapshot, spanish)));
  queueMicrotask(() => service.review.ensure().catch(() => undefined));
  return host;
}

function widgetText(snapshot, spanish) {
  if (snapshot.value) return `${snapshot.value.highlights.length} ${spanish ? 'subrayados' : 'highlights'}${snapshot.value.completed ? ' · ✓' : ''}`;
  const en = { idle: 'Open Readwise or add a token in Reader.', loading: 'Loading latest review…', empty: 'No scheduled review available.', error: 'Review unavailable. Open Readwise.' };
  const es = { idle: 'Abre Readwise o añade un token en Reader.', loading: 'Cargando el último repaso…', empty: 'No hay ningún repaso disponible.', error: 'Repaso no disponible. Abre Readwise.' };
  const messages = spanish ? es : en;
  return messages[snapshot.status] ?? messages.idle;
}

function freshness(snapshot, spanish) {
  const label = spanish ? 'Última consulta' : 'Last fetched';
  const cached = snapshot.cached || snapshot.status === 'error';
  const cacheLabel = spanish ? ' · En caché' : ' · Cached';
  const state = cached ? cacheLabel : '';
  const stale = Date.now() - snapshot.fetchedAt >= 15 * 60000;
  const staleLabel = spanish ? ' · Sin actualizar' : ' · Stale';
  const age = stale ? staleLabel : '';
  return `${label}: ${new Date(snapshot.fetchedAt).toLocaleString(spanish ? 'es' : 'en')}${state}${age}`;
}
