import { readingMetadataText } from './ui/freshness.js';
import { element } from './ui/cards.js';

export function readerWidget(service, language) {
  const node = element('div', 'reader-widget');
  node.dataset.readingReader = '';
  try {
    const data = service.read();
    const picks = data.picks;
    if (!picks?.documents.length) node.append(element('p', 'widget-note', language === 'es' ? 'Abre Reader para elegir lecturas.' : 'Open Reader to choose items.'));
    else {
      node.append(element('p', 'widget-note', readingMetadataText(data, language)));
      for (const document of picks.documents) {
        const link = element('a', 'module-link', document.title);
        link.href = document.url;
        link.rel = 'noopener noreferrer';
        link.addEventListener('click', event => { try { service.remember(document); } catch (error) { event.preventDefault(); const alert = element('p', 'save-alert', error.message); alert.setAttribute('role', 'alert'); node.append(alert); } });
        node.append(link);
      }
    }
  } catch { node.textContent = language === 'es' ? 'No se pudo leer la selección.' : 'Saved picks could not be read.'; }
  return node;
}
