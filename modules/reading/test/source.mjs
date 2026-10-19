import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const names = ['DEFAULTS', 'readConfigFromUrl', 'parseLocations', 'normalizeCount', 'normalizeProgress', 'normalizeOpen', 'clampInt', 'getBooleanParam', 'shouldAutoRunFromUrl', 'updatePickerUrl', 'parseReadingMinutes', 'getRemainingMinutes', 'normalizeProgressValue', 'filterDocuments', 'choosePicks', 'minimizeDocument', 'validateReaderUrl', 'fetchLocation', 'getDocuments', 'loadCache', 'saveCache', 'cacheConfigKey'];

function storage() {
  const values = new Map();
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
}
export async function reader(options = {}) {
  if (!process.env.DAILY_SOURCE_ROOT) {
    const { createReaderDomain } = await import('../src/domain.js');
    return createReaderDomain(options);
  }
  const location = new URL(options.url ?? 'https://example.test/reader/');
  const sessionStorage = storage();
  const localStorage = storage();
  const history = { replaceState: (state, title, value) => { location.href = value; } };
  const source = readFileSync(`${process.env.DAILY_SOURCE_ROOT}/.daily-reader-source/app.js`, 'utf8');
  const context = {
    URL, URLSearchParams, location, history, localStorage, sessionStorage, fetch: options.fetch,
    window: { addEventListener() {} }, console,
  };
  const api = vm.runInNewContext(`${source}\nui.status = {}; ({${names.join(',')}})`, context);
  const result = { location, sessionStorage, localStorage, defaults: structuredClone(api.DEFAULTS) };
  for (const name of names.filter(name => name !== 'DEFAULTS')) result[name] = (...args) => copy(api[name](...args));
  return result;
}
function copy(value) { return value instanceof Promise || value?.then ? Promise.resolve(value).then(structuredClone) : structuredClone(value); }
export function document(id, fields = {}) {
  return { id, title: `Article ${id}`, url: `https://read.readwise.io/read/${id}`, location: 'new', reading_time: '10 mins', reading_progress: 0, ...fields };
}
export function response(results, nextPageCursor = null) { return { ok: true, status: 200, json: async () => ({ results, nextPageCursor }) }; }
