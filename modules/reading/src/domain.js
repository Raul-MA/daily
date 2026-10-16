import * as metadata from './metadata.js';
import { choosePicks, filterDocuments } from './selection.js';
import { DEFAULTS, createConfig, clampInt, normalizeCount, normalizeProgress, normalizeOpen, parseLocations } from './config.js';
import { createMetadataCache } from './cache.js';
import { createDocumentClient } from './client.js';

export function createReaderDomain(options = {}) {
  const location = new URL(options.url ?? 'https://example.test/reader/');
  const cache = createMetadataCache(options.now ?? (() => Date.now()));
  const client = createDocumentClient(options.fetch ?? globalThis.fetch);
  async function getDocuments(config) {
    const saved = config.refresh ? null : cache.loadCache(config);
    if (saved) return saved;
    const all = [];
    for (const name of config.locations) all.push(...await client.fetchLocation(name, config));
    cache.saveCache(config, all);
    return all;
  }
  return {
    ...metadata, ...createConfig(location), ...cache, ...client, getDocuments, location,
    defaults: structuredClone(DEFAULTS), filterDocuments, clampInt, normalizeCount, normalizeProgress, normalizeOpen, parseLocations,
    choosePicks: (documents, config) => choosePicks(documents, config, options.random),
  };
}
