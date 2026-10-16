export function normalizeProgressValue(value) { return Math.min(1, Math.max(0, Number(value) || 0)); }
export function parseReadingMinutes(value, wordCount = 0) {
  if (typeof value === 'number') return Number.isFinite(value) ? Math.max(0, value) : 0;
  const match = String(value || '').match(/[\d.]+/);
  if (match) return Math.max(0, Number(match[0]) || 0);
  return wordMinutes(wordCount);
}
function wordMinutes(value) {
  const words = Math.max(0, Number(value) || 0);
  return words > 0 ? Math.max(1, Math.ceil(words / 238)) : 0;
}
export function getRemainingMinutes(doc) {
  const total = parseReadingMinutes(doc.reading_time, doc.word_count);
  if (total <= 0) return null;
  return Math.max(1, Math.ceil(total * (1 - normalizeProgressValue(doc.reading_progress))));
}
export function validateReaderUrl(value) {
  try {
    const url = new URL(value);
    if (url.username || url.password || url.port) return '';
    return url.protocol === 'https:' && ['read.readwise.io', 'readwise.io'].includes(url.hostname) ? url.href : '';
  } catch { return ''; }
}
function readingTime(value) { return ['number', 'string'].includes(typeof value) ? value : null; }
export function minimizeDocument(doc) {
  if (!doc || typeof doc !== 'object') return null;
  const url = validateReaderUrl(doc.url);
  if (!url) return null;
  return {
    id: String(doc.id || ''), url, ...textFields(doc),
    reading_progress: normalizeProgressValue(doc.reading_progress),
    reading_time: readingTime(doc.reading_time), word_count: Math.max(0, Number(doc.word_count) || 0),
  };
}
function textFields(doc) {
  return Object.fromEntries(['title', 'author', 'source', 'site_name', 'category', 'location'].map(key => [key, String(doc[key] || '')]));
}
