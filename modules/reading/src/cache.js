import { minimizeDocument } from './metadata.js';

export function cacheConfigKey(config) { return JSON.stringify({ locations: config.locations, scanLimit: config.scanLimit }); }
export function createMetadataCache(now) {
  let token;
  let cache = null;
  function account(value) { if (token !== value) { token = value; cache = null; } }
  function loadCache(config) {
    account(config.token);
    if (!cache || cache.key !== cacheConfigKey(config) || now() - cache.savedAt > config.cacheMinutes * 60000) {
      cache = null;
      return null;
    }
    return structuredClone(cache.documents);
  }
  function saveCache(config, documents) {
    account(config.token);
    cache = { key: cacheConfigKey(config), savedAt: now(), documents: documents.slice(0, config.scanLimit * config.locations.length).map(minimizeDocument).filter(Boolean) };
  }
  return { loadCache, saveCache, cacheConfigKey, cacheSnapshot: () => structuredClone(cache), clearCache: () => { cache = null; token = undefined; } };
}
