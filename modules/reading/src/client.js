const API_BASE = 'https://readwise.io/api/v3/list/';

function requestError(response) {
  if (response.status === 401) return new Error('The saved Readwise token is invalid. Open Settings and update it.');
  if (response.status === 429) return new Error('Readwise rate limit reached. Try again after a moment or lower the scan limit.');
  return new Error(`Readwise request failed (${response.status}).`);
}
async function page(location, cursor, config, fetcher) {
  const params = new URLSearchParams({ location, limit: '100' });
  if (cursor) params.set('pageCursor', cursor);
  const response = await fetcher(`${API_BASE}?${params}`, {
    headers: { Authorization: `Token ${config.token}` }, signal: config.signal ?? AbortSignal.timeout(20000),
    cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer',
  });
  if (!response.ok) throw requestError(response);
  const data = await response.json();
  if (!Array.isArray(data?.results)) throw new Error('Invalid Reader response.');
  return data;
}
export function createDocumentClient(fetcher) {
  const lastScan = { scanned: 0, truncated: false };
  async function fetchLocation(location, config) {
    const documents = [];
    const seen = new Set();
    let cursor = null;
    let scanned = 0;
    let requests = 0;
    do {
      const data = await page(location, cursor, config, fetcher);
      requests++;
      const remaining = Math.max(0, config.scanLimit - scanned);
      documents.push(...data.results.slice(0, remaining).filter(doc => doc && !doc.parent_id));
      scanned += data.results.length;
      cursor = data.nextPageCursor ?? null;
      if (cursor && (typeof cursor !== 'string' || seen.has(cursor))) throw new Error('Invalid or repeating Reader cursor.');
      seen.add(cursor);
    } while (cursor && scanned < config.scanLimit && requests < Math.ceil(config.scanLimit / 100));
    Object.assign(lastScan, { scanned, truncated: Boolean(cursor) });
    return documents;
  }
  return { fetchLocation, lastScan };
}
