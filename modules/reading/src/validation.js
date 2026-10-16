import { DEFAULTS } from './config.js';
import { validateReaderUrl } from './metadata.js';

const locations = ['new', 'later', 'shortlist'];
function integer(value, min, max) { return Number.isInteger(value) && value >= min && value <= max; }
function keys(value, expected) { return value && typeof value === 'object' && Object.keys(value).every(key => expected.includes(key)); }
function validLocations(value) { return Array.isArray(value) && value.length > 0 && value.length <= 3 && new Set(value).size === value.length && value.every(item => locations.includes(item)); }
function validSwitches(value) { return ['updateUrlOnPick', 'autoOpenSingle', 'rememberLastItem', 'includeUnknown'].every(key => typeof value[key] === 'boolean'); }
export function validSettings(value) {
  if (!keys(value, Object.keys(DEFAULTS)) || !validLocations(value.locations) || !validSwitches(value)) return false;
  return validLimits(value) && ['unfinished', 'started', 'unread'].includes(value.progress) && ['started-first', 'uniform'].includes(value.policy);
}
function validLimits(value) { return integer(value.count, 1, 20) && integer(value.minutes, 0, 10000) && integer(value.cacheMinutes, 1, 1440) && integer(value.scanLimit, 100, 2000); }
export function validDocument(value) {
  if (!value || typeof value.id !== 'string' || !value.id || !value.title) return false;
  const expected = ['id', 'url', 'title', 'author', 'source', 'site_name', 'category', 'location', 'reading_progress', 'reading_time', 'word_count'];
  if (!keys(value, expected) || !validateReaderUrl(value.url)) return false;
  return ['title', 'author', 'source', 'site_name', 'category', 'location'].every(key => typeof value[key] === 'string') && validReading(value);
}
function nonnegative(value) { return Number.isFinite(value) && value >= 0; }
function validTime(value) { return value === null || typeof value === 'string' || nonnegative(value); }
function validReading(value) {
  return validTime(value.reading_time) && nonnegative(value.word_count) && nonnegative(value.reading_progress) && value.reading_progress <= 1;
}
function validCollection(value) { return Array.isArray(value) && value.length <= 20; }
function validPicks(value) {
  if (value === null) return true;
  if (!keys(value, ['documents', 'selectedAt', 'settingsKey']) || !validCollection(value.documents)) return false;
  if (!Number.isFinite(value.selectedAt) || value.selectedAt < 0 || typeof value.settingsKey !== 'string') return false;
  return value.documents.every(validDocument) && new Set(value.documents.map(item => item.id)).size === value.documents.length;
}
export function initialReading() { return { settings: structuredClone(DEFAULTS), picks: null, lastItem: null }; }
export function validReadingData(value) {
  return keys(value, ['settings', 'picks', 'lastItem']) && validSettings(value.settings) && validPicks(value.picks) && (value.lastItem === null || validDocument(value.lastItem));
}
