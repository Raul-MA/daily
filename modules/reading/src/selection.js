import { getRemainingMinutes, normalizeProgressValue, validateReaderUrl } from './metadata.js';

function eligible(doc, config) {
  if (!isParent(doc)) return false;
  if (!config.locations.includes(doc.location) || !doc.title?.trim() || !validateReaderUrl(doc.url)) return false;
  return progressFits(doc, config) && timeFits(doc, config);
}
function isParent(doc) { return Boolean(doc?.id) && !doc.parent_id && !['highlight', 'note'].includes(doc.category); }
function progressFits(doc, config) {
  const progress = normalizeProgressValue(doc.reading_progress);
  if (progress >= 1) return false;
  if (config.progress === 'started') return progress > 0;
  return config.progress !== 'unread' || progress === 0;
}
function timeFits(doc, config) {
  if (config.minutes === 0) return true;
  const remaining = getRemainingMinutes(doc);
  return remaining === null ? Boolean(config.includeUnknown) : remaining <= config.minutes;
}
export function filterDocuments(documents, config) {
  const seen = new Set();
  return documents.filter(doc => {
    if (!eligible(doc, config) || seen.has(doc.id)) return false;
    seen.add(doc.id);
    return true;
  });
}
function shuffle(items, random) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index--) {
    const target = Math.floor(random() * (index + 1));
    [copy[index], copy[target]] = [copy[target], copy[index]];
  }
  return copy;
}
export function choosePicks(documents, config, random = Math.random) {
  const started = documents.filter(doc => normalizeProgressValue(doc.reading_progress) > 0);
  const unread = config.locations.map(location => documents.filter(doc => doc.location === location && normalizeProgressValue(doc.reading_progress) === 0));
  const buckets = config.policy === 'uniform' ? [documents] : [started, ...unread];
  const chosen = new Map();
  for (const bucket of buckets) {
    for (const doc of shuffle(bucket, random)) {
      chosen.set(doc.id, doc);
      if (chosen.size >= config.count) return [...chosen.values()];
    }
  }
  return [...chosen.values()];
}
