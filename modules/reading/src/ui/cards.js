import { readingMetadataText } from './freshness.js';
import { readerText, readerError } from './i18n.js';
import { getRemainingMinutes, parseReadingMinutes, normalizeProgressValue, validateReaderUrl } from '../metadata.js';
import { field } from './fields.js';

export function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
export function status(context, message, kind = '', settings = false) {
  const node = field(context, settings ? 'settingsStatus' : 'status');
  if (!node) return;
  node.textContent = message;
  node.className = `status ${kind}`;
}
function source(doc) { return doc.site_name || doc.author || doc.source || doc.category; }
export function card(context, doc, index) {
  const link = element('a', 'result-card');
  link.href = validateReaderUrl(doc.url);
  link.rel = 'noopener noreferrer';
  link.addEventListener('click', event => { try { context.service.remember(doc); } catch (error) { event.preventDefault(); status(context, readerError(context.language, error), 'error'); } });
  const top = element('div', 'result-top');
  top.append(element('h2', 'result-title', doc.title));
  if (Number.isInteger(index)) top.append(element('span', 'result-index', String(index + 1).padStart(2, '0')));
  const meta = element('div', 'result-meta');
  const remaining = getRemainingMinutes(doc);
  const progress = normalizeProgressValue(doc.reading_progress);
  const duration = remaining === null ? readerText(context.language, 'unknown') : readerText(context.language, 'left', { count: remaining });
  for (const text of [duration, progress > 0 ? readerText(context.language, 'progress', { count: Math.round(progress * 100) }) : readerText(context.language, 'unread'), readerText(context.language, ({ new: 'inbox', later: 'later', shortlist: 'shortlist' })[doc.location] ?? doc.location)]) meta.append(element('span', 'pill', text));
  const total = parseReadingMinutes(doc.reading_time, doc.word_count);
  if (total > 0) meta.append(element('span', 'pill', readerText(context.language, 'total', { count: total })));
  const open = element('div', 'open-row', readerText(context.language, 'open'));
  link.append(top, meta, element('div', 'result-source', source(doc)), open);
  return link;
}
export function renderPicks(context) {
  const data = context.service.read();
  const documents = data.picks?.documents ?? [];
  renderFreshness(context, data);
  field(context, 'results').replaceChildren(...documents.map((doc, index) => card(context, doc, index)));
  field(context, 'againButton').classList.toggle('hidden', !documents.length);
  field(context, 'lastItemSection').classList.toggle('hidden', !data.lastItem);
  field(context, 'lastItem').replaceChildren(...(data.lastItem ? [card(context, data.lastItem)] : []));
}

function renderFreshness(context, data) {
  const node = field(context, 'readerFreshness');
  node.hidden = !data.picks;
  if (!data.picks) return;
  node.textContent = readingMetadataText(data, context.language);
}
