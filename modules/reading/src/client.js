import { createRateLimit } from './rate-limit.js';
import { createReaderRequest } from './request.js';

const API_BASE = 'https://readwise.io/api/v3/list/';

async function page(input, config, request) {
  const params = new URLSearchParams({ location: input.location, limit: String(input.limit) });
  if (input.cursor) params.set('pageCursor', input.cursor);
  const data = await request(`${API_BASE}?${params}`, config);
  if (!Array.isArray(data?.results)) throw new Error('Invalid Reader response.');
  return data;
}
export function createDocumentClient(options) {
  const limiter = createRateLimit(options.now);
  const request = createReaderRequest(options, limiter);
  const lastScan = { scanned: 0, truncated: false };
  async function fetchLocation(location, config) {
    const documents = [];
    const seen = new Set();
    let cursor = null;
    let scanned = 0;
    let requests = 0;
    do {
      const remaining = Math.max(0, config.scanLimit - scanned);
      const data = await page({ location, cursor, limit: Math.min(100, remaining) }, config, request);
      requests++;
      documents.push(...data.results.slice(0, remaining).filter(doc => doc && !doc.parent_id));
      scanned += Math.min(remaining, data.results.length);
      cursor = data.nextPageCursor ?? null;
      if (cursor && (typeof cursor !== 'string' || seen.has(cursor))) throw new Error('Invalid or repeating Reader cursor.');
      seen.add(cursor);
    } while (cursor && scanned < config.scanLimit && requests < Math.ceil(config.scanLimit / 100));
    Object.assign(lastScan, { scanned, truncated: Boolean(cursor) });
    return documents;
  }
  async function fetchDocument(id, config) {
    const params = new URLSearchParams({ id });
    const data = await request(`${API_BASE}?${params}`, config);
    if (!Array.isArray(data?.results)) throw new Error('Invalid Reader response.');
    return data.results.find(item => String(item?.id) === id) ?? null;
  }
  return { fetchLocation, fetchDocument, lastScan, clearRequests: limiter.reset };
}
