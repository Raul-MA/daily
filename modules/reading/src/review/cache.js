import { readCache, writeCache, removeCache } from '../cache-storage.js';
import { emptyReview, normalizeReview } from './model.js';

const KEY = 'daily:readwise:review-cache:v1';
export function createReviewCache(options) {
  const identity = options.accountId ?? (() => '');
  function read() {
    const saved = readCache(options.cacheStorage, KEY, identity());
    if (!saved || !Number.isFinite(saved.fetchedAt)) return emptyReview();
    try {
      const record = saved.value;
      const value = normalizeReview({ review_id: record.id, review_url: record.url, review_completed: record.completed, highlights: record.highlights });
      return { status: 'ready', value, url: value.url, fetchedAt: saved.fetchedAt, cached: true, error: null };
    } catch { return emptyReview(); }
  }
  function write(state) { writeCache(options.cacheStorage, KEY, { version: 1, accountId: identity(), fetchedAt: state.fetchedAt, value: state.value }); }
  return { read, write, clear: () => removeCache(options.cacheStorage, KEY) };
}
