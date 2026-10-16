import { DEFAULTS, parseLocations } from './config.js';
import { validSettings, validDocument } from './validation.js';
import { minimizeDocument } from './metadata.js';

function object(value) { return value !== null && typeof value === 'object' && !Array.isArray(value); }
function savedSettings(storage) {
  const current = storage.getItem('readerPicker.settings.v2');
  const raw = current === null ? storage.getItem('readerPicker.settings.v1') : current;
  if (raw === null) return {};
  const value = JSON.parse(raw);
  if (!object(value)) throw new Error('Invalid original Reader preferences.');
  return value;
}
function settingsFrom(storage) {
  const saved = savedSettings(storage);
  const settings = Object.fromEntries(Object.keys(DEFAULTS).map(key => [key, Object.hasOwn(saved, key) ? saved[key] : DEFAULTS[key]]));
  for (const key of ['count', 'minutes', 'cacheMinutes', 'scanLimit']) settings[key] = Number(settings[key]);
  if (!Array.isArray(settings.locations)) throw new Error('Invalid original Reader locations.');
  settings.locations = parseLocations(settings.locations.join(',')) ?? [];
  if (!validSettings(settings)) throw new Error('Invalid original Reader preferences.');
  return settings;
}
function remembered(storage, enabled) {
  if (!enabled) return null;
  const raw = storage.getItem('readerPicker.lastItem.v1');
  if (raw === null) return null;
  const value = JSON.parse(raw);
  if (value === null) return null;
  const item = minimizeDocument(value);
  if (!validDocument(item)) throw new Error('Invalid remembered Reader item.');
  return item;
}
export function exportLegacyReader(storage) {
  const settings = settingsFrom(storage);
  return JSON.stringify({ app: 'reader-picker', schemaVersion: 1, settings, lastItem: remembered(storage, settings.rememberLastItem) }, null, 2);
}
