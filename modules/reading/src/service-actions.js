import { minimizeDocument, normalizeProgressValue } from './metadata.js';

function assertCurrent(service, request, settings, token) {
  if (request.signal.aborted || JSON.stringify(service.read().settings) !== settings || service.credentials.token() !== token) throw new Error('Reader request aborted because its account or settings changed.');
}
function resumable(doc) { return Boolean(doc) && !doc.parent_id && !['highlight', 'note'].includes(doc.category) && doc.location !== 'archive' && normalizeProgressValue(doc.reading_progress) < 1; }
export function readingActions(service) {
  async function pick(overrides = {}) {
    const token = service.credentials.token();
    if (!token) throw new Error('Add your Readwise token in Settings.');
    const data = service.read();
    const key = JSON.stringify(data.settings);
    const request = service.begin();
    const config = { ...data.settings, ...overrides, token, signal: request.signal };
    const documents = await service.domain.getDocuments(config);
    assertCurrent(service, request, key, token);
    const chosen = service.domain.choosePicks(service.domain.filterDocuments(documents, config), config).map(minimizeDocument);
    const scan = { scanned: service.domain.scanSummary.scanned, truncated: service.domain.scanSummary.truncated };
    const picks = { documents: chosen, selectedAt: service.now(), settingsKey: key, fetchedAt: service.domain.scanSummary.fetchedAt, scan };
    service.save({ ...service.read(), picks });
    return picks;
  }
  function remember(document) {
    const data = service.read();
    if (!data.settings.rememberLastItem) return;
    const item = minimizeDocument(document);
    if (!item) throw new Error('Invalid Reader document.');
    service.save({ ...data, lastItem: item });
  }
  async function revalidateLastItem() {
    const original = service.read();
    if (!original.settings.rememberLastItem || !original.lastItem || !service.credentials.token()) return null;
    const request = service.begin('last');
    const token = service.credentials.token();
    const current = await service.domain.fetchDocument(original.lastItem.id, { token, signal: request.signal });
    assertCurrent(service, request, JSON.stringify(original.settings), token);
    const data = service.read();
    if (data.lastItem?.id !== original.lastItem.id) throw new Error('Remembered item changed during validation.');
    const valid = resumable(current);
    const lastItem = valid ? minimizeDocument(current) : null;
    service.save({ ...data, lastItem });
    return lastItem;
  }
  return { pick, remember, revalidateLastItem };
}
