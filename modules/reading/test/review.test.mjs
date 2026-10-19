import test from 'node:test';
import assert from 'node:assert/strict';

const sample = { review_id: 7, review_url: 'https://readwise.io/reviews/7', review_completed: false, highlights: [{ id: 9, text: 'An ordinary highlight.', title: 'A book', note: 'A note' }] };
async function create(options = {}) {
  const { createReviewService } = await import('../src/review/service.js');
  return createReviewService({ token: () => 'fixture-only', now: () => 1000, ...options });
}
function reply(value = sample, status = 200) { return { ok: status < 400, status, json: async () => structuredClone(value) }; }

test('scheduled review without credentials retains its direct fallback and makes no request', async () => {
  let calls = 0;
  const service = await create({ token: () => '', fetch: async () => { calls++; return reply(); } });
  await service.refresh();
  assert.equal(calls, 0);
  assert.equal(service.snapshot().status, 'credentials');
  assert.equal(service.snapshot().url, 'https://readwise.io/dailyreview');
});

test('scheduled review uses the actual latest-review endpoint and ordinary highlights never become fabricated questions', async () => {
  const calls = [];
  const service = await create({ fetch: async (url, options) => { calls.push({ url, options }); return reply(); } });
  await service.refresh();
  assert.equal(calls[0].url, 'https://readwise.io/api/v2/review/');
  assert.equal(calls[0].options.headers.Authorization, 'Token fixture-only');
  assert.equal(calls[0].options.method, 'GET');
  const current = service.snapshot();
  assert.equal(current.value.highlights[0].kind, 'highlight');
  assert.equal(current.value.day, null);
  assert.equal(current.fetchedAt, 1000);
  assert.equal(current.value.completed, false);
  assert.equal(JSON.stringify(current).includes('fixture-only'), false);
});

test('absent review is empty while network and authorization failures preserve a previously cached review', async () => {
  let status = 200;
  const service = await create({ fetch: async () => reply(sample, status) });
  await service.refresh();
  status = 401;
  await assert.rejects(service.refresh(), /token|401|invalid/i);
  assert.equal(service.snapshot().value.id, '7');
  assert.equal(service.snapshot().cached, true);
  status = 404;
  await service.refresh();
  assert.equal(service.snapshot().status, 'empty');
  assert.equal(service.snapshot().value, null);
});

test('review completion is explicit server-confirmed and idempotent with a latest-review preflight', async () => {
  const methods = [];
  const service = await create({ fetch: async (url, options) => {
    methods.push(options.method);
    return url.endsWith('/complete/') ? reply({ review_id: 7, review_completed: true }) : reply();
  } });
  await service.refresh();
  assert.deepEqual(methods, ['GET']);
  const completion = service.complete();
  assert.equal(service.snapshot().status, 'completing');
  await completion;
  assert.deepEqual(methods, ['GET', 'GET', 'POST']);
  assert.equal(service.snapshot().value.completed, true);
  await service.complete();
  assert.equal(methods.length, 3);
});

test('changed latest review or failed completion never reports the displayed review complete', async () => {
  let changed = false;
  let posts = 0;
  const service = await create({ fetch: async (url, options) => {
    if (options.method === 'POST') { posts++; return reply({}, 500); }
    return reply(changed ? { ...sample, review_id: 8 } : sample);
  } });
  await service.refresh();
  changed = true;
  await assert.rejects(service.complete(), /changed|latest/i);
  assert.equal(posts, 0);
  assert.equal(service.snapshot().value.completed, false);
  changed = false;
  await service.refresh();
  await assert.rejects(service.complete(), /failed|500/i);
  assert.equal(posts, 1);
  assert.equal(service.snapshot().value.completed, false);
});

test('Never Soon Later and Someday hand off to Readwise without deleting or inventing scheduling', async () => {
  let calls = 0;
  const service = await create({ fetch: async () => { calls++; return reply(); } });
  await service.refresh();
  for (const action of ['never', 'soon', 'later', 'someday']) {
    const result = service.feedback(action);
    assert.equal(result.supported, false);
    assert.equal(result.url, sample.review_url);
  }
  assert.equal(calls, 1);
  assert.equal(service.snapshot().value.completed, false);
});

test('a late review response cannot replace the state after its account changes', async () => {
  let token = 'fixture-account-a';
  let resolve;
  const pending = new Promise(done => { resolve = done; });
  const service = await create({ token: () => token, fetch: async () => pending });
  const request = service.refresh();
  token = 'fixture-account-b';
  service.clear();
  resolve(reply());
  await assert.rejects(request, /abort|changed|obsolete/i);
  assert.equal(service.snapshot().value, null);
});

test('Q&A requires explicit structured capability hides answers initially and resets on card changes', async () => {
  const { createReviewPresentation } = await import('../src/review/presentation.js');
  const cards = [{ kind: 'qa', question: 'Which note?', answer: 'C' }, { kind: 'qa', question: 'Which chord?', answer: 'C major' }];
  const view = createReviewPresentation(cards, { qa: true });
  assert.equal(view.current().question, 'Which note?');
  assert.equal(view.current().answer, null);
  view.reveal();
  assert.equal(view.current().answer, 'C');
  view.next();
  assert.equal(view.current().answer, null);
  const unavailable = createReviewPresentation([{ text: 'A normal highlight?' }], { qa: false });
  assert.equal(unavailable.current().kind, 'highlight');
  assert.equal(unavailable.current().text, 'A normal highlight?');
});

test('review widgets reuse fresh results refresh after fifteen minutes and do not automatically loop after errors', async () => {
  let now = 1000;
  let calls = 0;
  let failed = false;
  const service = await create({ now: () => now, fetch: async () => { calls++; return reply(sample, failed ? 500 : 200); } });
  await service.ensure();
  await service.ensure();
  assert.equal(calls, 1);
  now += 16 * 60000;
  await service.ensure();
  assert.equal(calls, 2);
  now += 16 * 60000;
  failed = true;
  await assert.rejects(service.ensure(), /500|failed/i);
  await service.ensure();
  assert.equal(calls, 3);
});
