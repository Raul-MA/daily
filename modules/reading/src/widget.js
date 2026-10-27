import { readerError } from './ui/i18n.js';
import { readingMetadataText } from './ui/freshness.js';
import { getRemainingMinutes } from './metadata.js';
import { element } from './ui/cards.js';
import { localDay } from './daily.js';
import { widgetButton, widgetStatus } from './widget-ui.js';

function documentRow(service, document, spanish, host) {
  const row = element('li', 'daily-read');
  row.append(element('h3', 'daily-read-title', document.title));
  const source = [...new Set([document.author, document.site_name || document.source].filter(Boolean))];
  if (source.length) row.append(element('p', 'reading-detail', source.join(' / ')));
  const remaining = getRemainingMinutes(document);
  const unknown = spanish ? 'Tiempo de lectura no disponible' : 'Reading time unavailable';
  const duration = remaining === null ? unknown : `${remaining} min ${spanish ? 'restantes' : 'remaining'}`;
  row.append(element('p', 'reading-detail', duration));
  const link = element('a', 'daily-read-open', spanish ? 'Abrir en Reader' : 'Open in Reader');
  link.href = document.url;
  link.rel = 'noopener noreferrer';
  link.addEventListener('click', event => {
    try { service.remember(document); }
    catch (error) { event.preventDefault(); host.append(widgetStatus(readerError(spanish ? 'es' : 'en', error), true)); }
  });
  row.append(link);
  return row;
}

function selection(host, service, language, data) {
  const spanish = language === 'es';
  if (!data.picks) return;
  const documents = data.picks.documents;
  const current = localDay(data.picks.selectedAt) === localDay();
  host.append(selectionHeading(current, spanish));
  if (!documents.length) host.append(widgetStatus(spanish ? 'No hay lecturas que coincidan con tus ajustes. Cambia los filtros en Reader.' : 'No reads match your settings. Change your filters in Reader.'));
  const list = element('ul', 'daily-reads');
  for (const document of documents) list.append(documentRow(service, document, spanish, host));
  host.append(list);
  const details = element('details', 'reading-freshness');
  details.append(element('summary', '', spanish ? 'Detalles de la selección' : 'Selection details'), element('p', 'reading-detail', readingMetadataText(data, language)));
  host.append(details);
}

function selectionHeading(current, spanish) {
  const titles = current ? ['Today’s reads', 'Lecturas de hoy'] : ['Previous reads', 'Lecturas anteriores'];
  return element('h3', 'reading-section-title', titles[spanish ? 1 : 0]);
}

function readerState(host, service, language) {
  const spanish = language === 'es';
  const state = service.daily.snapshot();
  if (!service.token()) host.append(widgetStatus(spanish ? 'Conecta Readwise en los ajustes de Reader para elegir tus lecturas diarias.' : 'Connect Readwise in Reader settings to choose your daily reads.'));
  if (state.status === 'loading') host.append(widgetStatus(spanish ? 'Eligiendo tus lecturas…' : 'Choosing your reads…'));
  if (state.status === 'error') host.append(widgetStatus(readerError(language, state.error), true));
  if (!service.token()) return;
  const pick = widgetButton(spanish ? 'Elegir de nuevo' : 'Pick again', 'reader-again', () => service.daily.refresh().catch(() => undefined));
  pick.disabled = state.status === 'loading';
  host.append(pick);
}

export function readerWidget(service, language) {
  const host = element('div', 'reader-widget reading-dashboard');
  host.dataset.readingReader = '';
  const spanish = language === 'es';
  try {
    const data = service.read();
    selection(host, service, language, data);
    readerState(host, service, language);
    queueMicrotask(() => { if (host.isConnected) service.daily.ensure().catch(() => undefined); });
  } catch { host.append(widgetStatus(spanish ? 'No se pudo leer la selección.' : 'Saved picks could not be read.', true)); }
  return host;
}
