export const DEFAULTS = Object.freeze({
  locations: ['new', 'later', 'shortlist'], progress: 'unfinished', minutes: 10, count: 3,
  cacheMinutes: 15, scanLimit: 500, updateUrlOnPick: false, autoOpenSingle: false, rememberLastItem: false,
  policy: 'started-first', includeUnknown: false,
});
export function clampInt(value, min, max, fallback) {
  if (value === null || value === undefined || value === '') return fallback;
  const number = Number.parseInt(value, 10);
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
}
export function normalizeCount(raw, fallback) {
  const number = Number(raw);
  return Number.isInteger(number) && number >= 1 && number <= 20 ? number : fallback;
}
export function normalizeProgress(raw, fallback) { return ['unfinished', 'started', 'unread'].includes(raw) ? raw : fallback; }
export function normalizeOpen(raw) { return ['auto', '1', 'true', 'yes'].includes(String(raw || '').toLowerCase()); }
export function parseLocations(raw) {
  if (!raw) return null;
  const aliases = { inbox: 'new', new: 'new', later: 'later', shortlist: 'shortlist' };
  const locations = raw.split(',').map(value => aliases[value.trim().toLowerCase()]).filter(Boolean);
  return locations.length ? [...new Set(locations)].slice(0, 3) : null;
}
export function createConfig(location) {
  function getBooleanParam(name, fallback) {
    const raw = location.searchParams.get(name);
    return raw === null ? fallback : ['1', 'true', 'yes', 'on'].includes(raw.toLowerCase());
  }
  function readConfigFromUrl(settings) {
    const params = location.searchParams;
    return {
      ...settings, minutes: clampInt(params.get('minutes'), 0, 10000, settings.minutes),
      count: normalizeCount(params.get('count'), settings.count), progress: normalizeProgress(params.get('progress'), settings.progress),
      locations: parseLocations(params.get('locations')) || settings.locations,
      open: params.has('open') ? normalizeOpen(params.get('open')) : Boolean(settings.autoOpenSingle),
      refresh: getBooleanParam('refresh', false), scanLimit: clampInt(params.get('scan'), 100, 2000, settings.scanLimit),
    };
  }
  function updatePickerUrl(config) {
    location.search = '';
    const values = { count: config.count, minutes: config.minutes, progress: config.progress, locations: config.locations.join(','), scan: config.scanLimit, run: 1 };
    for (const [key, value] of Object.entries(values)) location.searchParams.set(key, String(value));
    if (config.count === 1 && config.open) location.searchParams.set('open', 'auto');
  }
  return { getBooleanParam, readConfigFromUrl, updatePickerUrl, shouldAutoRunFromUrl: () => getBooleanParam('run', false) || getBooleanParam('auto', false) };
}
