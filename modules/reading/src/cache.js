import { minimizeDocument } from './metadata.js';
import { readCache, writeCache, removeCache } from './cache-storage.js';

const KEY = 'daily:readwise:reader-cache:v1';
export function cacheConfigKey(config) { return JSON.stringify({ locations: config.locations, scanLimit: config.scanLimit }); }
function normalize(value) {
  if (!value || typeof value.key !== 'string' || !Number.isFinite(value.savedAt) || !Array.isArray(value.documents)) return null;
  return { version: 1, accountId: value.accountId, key: value.key, savedAt: value.savedAt, documents: value.documents.map(minimizeDocument).filter(Boolean), scan: value.scan ?? null };
}
export function createMetadataCache(options) {
  const identity = options.accountId ?? (() => '');
  let token;
  let initialized = false;
  let cache = normalize(readCache(options.cacheStorage, KEY, identity()));
  function clearCache() { cache = null; token = undefined; initialized = false; removeCache(options.cacheStorage, KEY); }
  function account(value) {
    if (initialized && token !== value) clearCache();
    initialized = true;
    token = value;
    if (cache && cache.accountId !== identity()) clearCache();
  }
  function loadCache(config) {
    account(config.token);
    if (!cache || cache.key !== cacheConfigKey(config) || options.now() - cache.savedAt > config.cacheMinutes * 60000) {
      cache = null;
      return null;
    }
    return structuredClone(cache.documents);
  }
  function saveCache(config, documents, scan = null) {
    account(config.token);
    cache = { version: 1, accountId: identity(), key: cacheConfigKey(config), savedAt: options.now(), documents: documents.slice(0, config.scanLimit * config.locations.length).map(minimizeDocument).filter(Boolean), scan };
    writeCache(options.cacheStorage, KEY, cache);
  }
  return { loadCache, saveCache, cacheConfigKey, cacheSnapshot: () => structuredClone(cache), clearCache };
}
