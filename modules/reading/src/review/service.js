import { createReviewCache } from './cache.js';
import { createRateLimit } from '../rate-limit.js';
import { createReaderRequest } from '../request.js';
import { emptyReview, normalizeReview, DIRECT_REVIEW } from './model.js';

const REVIEW_URL = 'https://readwise.io/api/v2/review/';
const COMPLETE_URL = 'https://readwise.io/api/v2/review/complete/';
function check(options, operation) {
  if (operation.controller.signal.aborted || options.token() !== operation.token) throw new Error('Review request aborted because its account changed.');
}
function begin(options, previous) {
  previous?.controller.abort();
  return { token: options.token(), controller: new AbortController() };
}
function config(operation, method = 'GET') { return { token: operation.token, signal: operation.controller.signal, method }; }
function confirmed(result, id) {
  if (String(result?.review_id) !== id || result.review_completed !== true) throw new Error('Review completion was not confirmed by Readwise.');
}
async function completeLatest(options, operation, current, actions) {
  const latest = normalizeReview(await actions.request(REVIEW_URL, config(operation)));
  check(options, operation);
  if (latest.id !== current.id) throw new Error('The latest review changed. Refresh before completing it.');
  if (latest.completed) return actions.accept(latest);
  const result = await actions.request(COMPLETE_URL, config(operation, 'POST'));
  check(options, operation);
  confirmed(result, current.id);
  return actions.accept({ ...current, completed: true });
}
export function createReviewService(options) {
  const now = options.now ?? (() => Date.now());
  const limiter = createRateLimit(now);
  const request = createReaderRequest({ fetch: options.fetch ?? globalThis.fetch.bind(globalThis), now, timeoutMs: options.timeoutMs }, limiter);
  const emit = options.emit ?? (() => undefined);
  const cache = createReviewCache(options);
  let state = cache.read();
  let pending = null;
  function accept(value) { state = { status: 'ready', value, url: value.url, fetchedAt: now(), cached: false, error: null }; cache.write(state); emit(); return value; }
  async function refresh() {
    if (!options.token()) { state = emptyReview('credentials'); emit(); return null; }
    const operation = begin(options, pending);
    pending = operation;
    state = { ...state, status: 'loading', error: null };
    emit();
    try {
      const data = await request(REVIEW_URL, config(operation));
      check(options, operation);
      return accept(normalizeReview(data));
    } catch (error) {
      check(options, operation);
      if (error.status === 404) { state = emptyReview('empty'); emit(); return null; }
      state = { ...state, status: 'error', cached: Boolean(state.value), error: error.message, errorStatus: error.status ?? null, retryAfterSeconds: error.retryAfterSeconds ?? null };
      emit();
      throw error;
    }
  }
  async function complete() {
    if (!state.value || !options.token()) throw new Error('No review is available to complete.');
    if (state.value.completed) return state.value;
    if (state.status === 'completing') throw new Error('Review completion is already in progress.');
    const current = state.value;
    const operation = begin(options, pending);
    pending = operation;
    state = { ...state, status: 'completing', error: null };
    emit();
    try { return await completeLatest(options, operation, current, { request, accept }); }
    catch (error) {
      check(options, operation);
      state = { ...state, status: 'error', cached: true, error: error.message, errorStatus: error.status ?? null, retryAfterSeconds: error.retryAfterSeconds ?? null };
      emit();
      throw error;
    }
  }

  function feedback(action) {
    if (!['never', 'soon', 'later', 'someday'].includes(action)) throw new Error('Unknown review feedback.');
    return { supported: false, url: state.value?.url ?? DIRECT_REVIEW };
  }
  function clear() { pending?.controller.abort(); pending = null; limiter.reset(); cache.clear(); state = emptyReview(); emit(); }
  function ensure() {
    if (state.status === 'idle' || state.status === 'ready' && now() - state.fetchedAt >= 15 * 60000) return refresh();
    return Promise.resolve(state.value);
  }
  return { refresh, complete, feedback, clear, ensure, snapshot: () => structuredClone(state), stop: () => pending?.controller.abort() };
}
