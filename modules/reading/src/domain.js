import * as metadata from './metadata.js';
import { choosePicks, filterDocuments } from './selection.js';
import { DEFAULTS, createConfig, clampInt, normalizeCount, normalizeProgress, normalizeOpen, parseLocations } from './config.js';
import { createMetadataCache } from './cache.js';
import { createDocumentClient } from './client.js';

export function createReaderDomain(options = {}) {
  const location = new URL(options.url ?? 'https://example.test/reader/');
  const cache = createMetadataCache({ ...options, now: options.now ?? (() => Date.now()) });
  const client = createDocumentClient({ fetch: options.fetch ?? globalThis.fetch.bind(globalThis), now: options.now ?? (() => Date.now()), timeoutMs: options.timeoutMs });
  const scanSummary = { scanned: null, truncated: null, fetchedAt: null };
  async function getDocuments(config) {
    const saved = config.refresh ? null : cache.loadCache(config);
    if (saved) {
      const metadata = cache.cacheSnapshot();
      Object.assign(scanSummary, metadata.scan ?? { scanned: null, truncated: null }, { fetchedAt: metadata.savedAt });
      return saved;
    }
    const all = [];
    Object.assign(scanSummary, { scanned: 0, truncated: false });
    for (const name of config.locations) {
      all.push(...await client.fetchLocation(name, config));
      scanSummary.scanned += client.lastScan.scanned;
      scanSummary.truncated ||= client.lastScan.truncated;
    }
    cache.saveCache(config, all, { ...scanSummary });
    scanSummary.fetchedAt = cache.cacheSnapshot().savedAt;
    return all;
  }
  return {
    ...metadata, ...createConfig(location), ...cache, ...client, getDocuments, location, scanSummary,
    defaults: structuredClone(DEFAULTS), filterDocuments, clampInt, normalizeCount, normalizeProgress, normalizeOpen, parseLocations,
    choosePicks: (documents, config) => choosePicks(documents, config, options.random),
    clearCache: () => { cache.clearCache(); client.clearRequests(); },
  };
}
