import { minimizeDocument } from './metadata.js';

function assertCurrent(service, request, settings, token) {
  if (request.signal.aborted || JSON.stringify(service.read().settings) !== settings || service.credentials.token() !== token) throw new Error('Reader request aborted because its account or settings changed.');
}
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
    const picks = { documents: chosen, selectedAt: service.now(), settingsKey: key };
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
  return { pick, remember };
}
