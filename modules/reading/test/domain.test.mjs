import test from 'node:test';
import assert from 'node:assert/strict';
import { reader, document } from './source.mjs';

test('Reader duration parsing preserves numeric text and word-count estimates', async () => {
  const api = await reader();
  assert.equal(api.parseReadingMinutes(7.5), 7.5);
  assert.equal(api.parseReadingMinutes('12 mins'), 12);
  assert.equal(api.parseReadingMinutes(null, 477), 3);
  assert.equal(api.parseReadingMinutes(-4), 0);
});

test('Reader progress is bounded and remaining time rounds upward with a one-minute floor', async () => {
  const api = await reader();
  assert.equal(api.normalizeProgressValue(-2), 0);
  assert.equal(api.normalizeProgressValue(4), 1);
  assert.equal(api.normalizeProgressValue('0.5'), 0.5);
  assert.equal(api.getRemainingMinutes(document('a', { reading_progress: 0.51 })), 5);
  assert.equal(api.getRemainingMinutes(document('b', { reading_progress: 0.999 })), 1);
});

test('Reader eligibility deduplicates IDs and applies progress remaining-time and safe-link filters', async () => {
  const api = await reader();
  const documents = [document('a'), document('a'), document('b', { reading_progress: 0.5 }), document('c', { reading_progress: 1 }), document('d', { url: 'javascript:alert(1)' })];
  const config = { ...api.defaults, minutes: 5 };
  assert.deepEqual(api.filterDocuments(documents, config).map(item => item.id), ['b']);
  assert.deepEqual(api.filterDocuments(documents, { ...config, minutes: 0, progress: 'unread' }).map(item => item.id), ['a']);
  assert.deepEqual(api.filterDocuments(documents, { ...config, progress: 'started' }).map(item => item.id), ['b']);
});

test('Reader selection prioritizes started items then configured location order without duplicates', async () => {
  const api = await reader();
  const documents = [document('new'), document('later', { location: 'later' }), document('started', { location: 'shortlist', reading_progress: 0.5 })];
  const before = structuredClone(documents);
  const config = { ...api.defaults, locations: ['later', 'new', 'shortlist'], count: 3 };
  assert.deepEqual(api.choosePicks(documents, config).map(item => item.id), ['started', 'later', 'new']);
  assert.deepEqual(documents, before);
  assert.equal(api.choosePicks(documents, { ...config, count: 5 }).length, 3);
});

test('Reader links accept only HTTPS Reader hosts and metadata minimization excludes content and tokens', async () => {
  const api = await reader();
  for (const url of ['http://readwise.io/read/a', 'https://readwise.io.evil.test/a', 'javascript:alert(1)', 'broken']) assert.equal(api.validateReaderUrl(url), '');
  assert.equal(api.validateReaderUrl('https://readwise.io/read/a'), 'https://readwise.io/read/a');
  const item = api.minimizeDocument(document('a', { html_content: 'private content', token: 'fixture-only' }));
  assert.equal(item.id, 'a');
  assert.equal(Object.hasOwn(item, 'html_content'), false);
  assert.equal(Object.hasOwn(item, 'token'), false);
});

test('Reader URL configuration preserves aliases location priority and supported shortcut controls', async () => {
  const api = await reader({ url: 'https://example.test/?count=5&minutes=17&progress=started&locations=shortlist,inbox,later,shortlist&open=auto&scan=1000&refresh=1&run=1' });
  const config = api.readConfigFromUrl(api.defaults);
  assert.equal(config.count, 5);
  assert.equal(config.minutes, 17);
  assert.deepEqual(config.locations, ['shortlist', 'new', 'later']);
  assert.equal(config.progress, 'started');
  assert.equal(config.scanLimit, 1000);
  assert.equal(config.open, true);
  assert.equal(config.refresh, true);
  assert.equal(api.shouldAutoRunFromUrl(), true);
});

test('Reader invalid URL preferences retain defaults and advanced limits remain bounded', async () => {
  const api = await reader({ url: 'https://example.test/?count=21&progress=bogus&locations=archive&scan=99999' });
  const config = api.readConfigFromUrl(api.defaults);
  assert.equal(config.count, 3);
  assert.equal(config.progress, 'unfinished');
  assert.deepEqual(config.locations, ['new', 'later', 'shortlist']);
  assert.equal(config.scanLimit, 2000);
  assert.equal(api.clampInt('', 1, 20, 3), 3);
  assert.equal(api.clampInt('bad', 1, 20, 3), 3);
});

test('Reader generated shortcut URLs preserve picking controls and exclude tokens', async () => {
  const api = await reader();
  api.updatePickerUrl({ ...api.defaults, count: 1, open: true, token: 'fixture-only' });
  assert.equal(api.location.searchParams.get('count'), '1');
  assert.equal(api.location.searchParams.get('run'), '1');
  assert.equal(api.location.searchParams.get('open'), 'auto');
  assert.equal(api.location.href.includes('fixture-only'), false);
});
