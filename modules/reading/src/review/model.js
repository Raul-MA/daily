import { validateReaderUrl } from '../metadata.js';

export const DIRECT_REVIEW = 'https://readwise.io/dailyreview';
function highlight(value) {
  if (!value || value.id === undefined || typeof value.text !== 'string') throw new Error('Invalid review highlight.');
  return { kind: 'highlight', id: String(value.id), text: value.text, title: String(value.title ?? ''), author: String(value.author ?? ''), note: String(value.note ?? '') };
}
export function normalizeReview(value) {
  if (!value || !['string', 'number'].includes(typeof value.review_id) || !Array.isArray(value.highlights) || typeof value.review_completed !== 'boolean') throw new Error('Invalid scheduled review response.');
  return { id: String(value.review_id), url: validateReaderUrl(value.review_url) || DIRECT_REVIEW, completed: value.review_completed, day: null, highlights: value.highlights.map(highlight) };
}
export function emptyReview(status = 'idle') { return { status, value: null, url: DIRECT_REVIEW, fetchedAt: null, cached: false, error: null }; }
