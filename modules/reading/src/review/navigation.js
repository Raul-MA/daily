import { readCache, writeCache, removeCache } from '../cache-storage.js';

const KEY = 'daily:readwise:review-position:v1';
export function createReviewNavigation(options) {
  let memory = null;
  const identity = options.accountId ?? (() => '');
  const storage = options.storage ?? globalThis.localStorage;
  function read(review) {
    const saved = memory ?? readCache(storage, KEY, identity());
    if (saved?.accountId !== identity() || saved.reviewId !== review.id || !Number.isInteger(saved.index) || saved.index < 0) return { index: 0, revisiting: false };
    return { index: Math.min(saved.index, Math.max(0, review.highlights.length - 1)), revisiting: saved.revisiting === true };
  }
  function save(review, index, revisiting) {
    const bounded = Math.max(0, Math.min(index, Math.max(0, review.highlights.length - 1)));
    memory = { version: 1, accountId: identity(), reviewId: review.id, index: bounded, revisiting };
    return writeCache(storage, KEY, memory);
  }
  function clear() { memory = null; removeCache(storage, KEY); }
  return { read, save, clear };
}
