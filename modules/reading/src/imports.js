import { DataConflictError } from '../../../packages/data/src/errors.js';
import { DEFAULTS, parseLocations } from './config.js';
import { minimizeDocument } from './metadata.js';
import { initialReading, validReadingData } from './validation.js';

function legacyData(input) {
  const source = input.settings ?? {};
  const settings = Object.fromEntries(Object.keys(DEFAULTS).map(key => [key, Object.hasOwn(source, key) ? source[key] : DEFAULTS[key]]));
  for (const key of ['count', 'minutes', 'cacheMinutes', 'scanLimit']) settings[key] = Number(settings[key]);
  if (!Array.isArray(settings.locations)) throw new Error('Invalid Reader locations.');
  settings.locations = parseLocations(settings.locations.join(',')) ?? [];
  let lastItem = null;
  if (settings.rememberLastItem && input.lastItem) {
    lastItem = minimizeDocument(input.lastItem);
    if (!lastItem) throw new Error('Invalid remembered Reader item.');
  }
  return { ...initialReading(), settings, lastItem };
}
function parseBackup(text) {
  const input = JSON.parse(text);
  if (!['daily-reading', 'reader-picker'].includes(input?.app)) throw new Error('Unsupported Reader backup format.');
  if (input.schemaVersion !== 1) throw new Error('Unsupported Reader schema version.');
  const data = input.app === 'reader-picker' ? legacyData(input) : input.data;
  if (!validReadingData(data)) throw new Error('Invalid Reader backup.');
  return data;
}
export function readingImports(state, service) {
  const previews = new WeakMap();
  function previewImport(text) {
    const data = parseBackup(text);
    const preview = { data, counts: { picks: data.picks?.documents.length ?? 0, lastItem: data.lastItem ? 1 : 0 } };
    previews.set(preview, { root: JSON.stringify(state.read().value), data: JSON.stringify(preview) });
    return preview;
  }
  function applyImport(preview) {
    const expected = previews.get(preview);
    if (!expected) throw new Error('Unknown Reader import preview.');
    if (expected.root !== JSON.stringify(state.read().value)) throw new DataConflictError();
    if (expected.data !== JSON.stringify(preview)) throw new Error('Changed Reader import preview.');
    service.save({ ...service.read(), ...preview.data });
    previews.delete(preview);
    try { service.releaseCredentials(); }
    catch (error) { error.rootApplied = true; throw error; }
  }
  return {
    previewImport, applyImport,
    exportBackup: () => JSON.stringify({ app: 'daily-reading', schemaVersion: 1, data: service.read() }, null, 2),
    exportRecovery: () => JSON.stringify(state.read().value, null, 2),
  };
}
