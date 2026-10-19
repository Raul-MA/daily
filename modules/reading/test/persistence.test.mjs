import test from 'node:test';
import assert from 'node:assert/strict';
import { createDailyState } from '../../../packages/data/src/daily-state.js';
import { document, response } from './source.mjs';

async function setup(options = {}) {
  const { connectReading } = await import('../src/service.js');
  const values = new Map();
  const session = new Map();
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
  const sessionStorage = { getItem: key => session.get(key) ?? null, setItem: (key, value) => session.set(key, value), removeItem: key => session.delete(key) };
  const state = createDailyState(storage);
  const fetcher = async () => response([document('a')]);
  const service = connectReading(state, { storage, sessionStorage, fetch: options.fetch ?? fetcher, now: options.now });
  return { service, values, session, storage, state };
}

test('Reader startup is read-only and preference saves preserve other modules and global language', async () => {
  const { service, values, state } = await setup();
  assert.equal(service.read().settings.count, 3);
  assert.equal(values.size, 0);
  state.commit(root => ({ ...root, preferences: { ...root.preferences, language: 'es' }, modules: { coffee: { version: 1, data: { fixture: true } } } }));
  const data = service.read();
  service.save({ ...data, settings: { ...data.settings, count: 7, locations: ['shortlist', 'new'] } });
  assert.equal(service.read().settings.count, 7);
  assert.equal(state.read().value.preferences.language, 'es');
  assert.deepEqual(state.read().value.modules.coffee.data, { fixture: true });
});

test('Reader invalid settings future data stale edits and failed writes retain the previous root', async () => {
  const { service, state, storage } = await setup();
  const data = service.read();
  assert.throws(() => service.save({ ...data, settings: { ...data.settings, count: 21 } }), /invalid/i);
  service.save(data);
  const stale = service.read();
  service.save({ ...stale, settings: { ...stale.settings, count: 5 } });
  assert.throws(() => service.save(stale), /changed|conflict/i);
  const current = state.read().value;
  state.commit(root => ({ ...root, modules: { ...root.modules, reading: { version: 99, data: {} } } }));
  assert.throws(() => service.read(), /version/i);
  state.commit(() => current);
  const before = state.read().value;
  storage.setItem = () => { throw new Error('QuotaExceededError'); };
  assert.throws(() => service.save(service.read()), /QuotaExceeded/);
  assert.deepEqual(state.read().value, before);
});

test('Reader credentials are memory-only by default and optional remembered tokens stay outside root backups', async () => {
  const { service, values, session } = await setup();
  service.setToken('fixture-private', 'memory');
  assert.equal(service.token(), 'fixture-private');
  assert.equal([...values.values()].some(value => value.includes('fixture-private')), false);
  assert.equal(session.size, 0);
  service.setToken('fixture-private', 'session');
  assert.equal(session.has('daily:readwise:session:v1'), true);
  assert.equal((values.get('daily:v1') ?? '').includes('fixture-private'), false);
  service.setToken('fixture-private', 'persistent');
  assert.equal(values.has('daily:readwise:token:v1'), true);
  assert.equal(session.has('daily:readwise:session:v1'), false);
});

test('Reader current picks persist separately from preferences and forget clears account data while retaining settings', async () => {
  const { service, state } = await setup();
  service.setToken('fixture-private', 'memory');
  const data = service.read();
  service.save({ ...data, settings: { ...data.settings, count: 2, rememberLastItem: true } });
  await service.pick();
  assert.deepEqual(service.read().picks.documents.map(item => item.id), ['a']);
  service.remember(service.read().picks.documents[0]);
  assert.equal(service.read().lastItem.id, 'a');
  assert.equal(JSON.stringify(state.read().value).includes('fixture-private'), false);
  service.forgetToken();
  assert.equal(service.read().picks, null);
  assert.equal(service.read().lastItem, null);
  assert.equal(service.read().settings.count, 2);
  assert.equal(service.token(), '');
});

test('Reader token changes cancel obsolete requests and prevent previous-account results from committing', async () => {
  let resolve;
  const pending = new Promise(done => { resolve = done; });
  const { service, state } = await setup({ fetch: async () => pending });
  service.setToken('fixture-account-a', 'memory');
  const request = service.pick();
  service.setToken('fixture-account-b', 'memory');
  resolve(response([document('old-account')]));
  await assert.rejects(request, /abort|obsolete|changed/i);
  assert.equal(service.read().picks, null);
  assert.equal(JSON.stringify(state.read().value).includes('old-account'), false);
});

test('Reader settings changes discard pending picks rather than committing results for obsolete filters', async () => {
  let resolve;
  const pending = new Promise(done => { resolve = done; });
  const { service } = await setup({ fetch: async () => pending });
  service.setToken('fixture-account-a', 'memory');
  const request = service.pick();
  const data = service.read();
  service.save({ ...data, settings: { ...data.settings, minutes: 4 } });
  resolve(response([document('obsolete')]));
  await assert.rejects(request, /abort|obsolete|changed/i);
  assert.equal(service.read().picks, null);
});

test('Reader revalidates a remembered item by ID and removes archived completed or missing items', async () => {
  for (const current of [document('a', { location: 'archive' }), document('a', { reading_progress: 1 }), null]) {
    const calls = [];
    const { service } = await setup({ fetch: async url => { calls.push(new URL(url)); return response(current ? [current] : []); } });
    service.setToken('fixture-only');
    const data = service.read();
    service.save({ ...data, settings: { ...data.settings, rememberLastItem: true } });
    service.remember(document('a'));
    await service.revalidateLastItem();
    assert.equal(calls[0].searchParams.get('id'), 'a');
    assert.equal(service.read().lastItem, null);
  }
});

test('Reader remembered-item validation updates progress and keeps the previous item on request failure', async () => {
  let status = 200;
  const { service } = await setup({ fetch: async () => status === 200 ? response([document('a', { reading_progress: 0.5 })]) : { ok: false, status } });
  service.setToken('fixture-only');
  const data = service.read();
  service.save({ ...data, settings: { ...data.settings, rememberLastItem: true } });
  service.remember(document('a'));
  await service.revalidateLastItem();
  assert.equal(service.read().lastItem.reading_progress, 0.5);
  const before = service.read().lastItem;
  status = 401;
  await assert.rejects(service.revalidateLastItem(), /token|invalid/i);
  assert.deepEqual(service.read().lastItem, before);
});

test('Reader picks distinguish selection time from metadata fetch time when picking again from cache', async () => {
  let now = 1000;
  const { service } = await setup({ now: () => now });
  service.setToken('fixture-only');
  await service.pick();
  assert.equal(service.read().picks.fetchedAt, 1000);
  now += 60000;
  await service.pick();
  assert.equal(service.read().picks.selectedAt, 61000);
  assert.equal(service.read().picks.fetchedAt, 1000);
  assert.equal(service.read().picks.scan.truncated, false);
});

test('Reader forgetting credentials succeeds even when clearing canonical cached picks hits quota', async () => {
  const { service, storage, state, session } = await setup();
  service.setToken('fixture-private', 'session');
  await service.pick();
  const before = state.read().value;
  storage.setItem = () => { throw new Error('QuotaExceededError'); };
  assert.throws(() => service.forgetToken(), /QuotaExceeded/);
  assert.equal(service.token(), '');
  assert.equal(session.has('daily:readwise:session:v1'), false);
  assert.deepEqual(state.read().value, before);
});

test('Reader account changes in another tab reject late picks and require the old tab to reconnect', async () => {
  let resolve;
  const pending = new Promise(done => { resolve = done; });
  const { service, state, storage } = await setup({ fetch: async () => pending });
  const { connectReading } = await import('../src/service.js');
  service.setToken('fixture-account-a');
  const request = service.pick();
  const other = connectReading(createDailyState(storage), { storage });
  other.setToken('fixture-account-b');
  resolve(response([document('obsolete-account')]));
  await assert.rejects(request, /abort|changed|account/i);
  assert.equal(service.read().picks, null);
  assert.equal(service.token(), '');
  await assert.rejects(service.pick(), /token/i);
  assert.equal(other.token(), 'fixture-account-b');
  assert.equal(JSON.stringify(state.read().value).includes('fixture-account'), false);
});


test('Reader cannot revive an obsolete session token by reopening a tab after another account was selected', async () => {
  const { service, storage, session } = await setup();
  service.setToken('fixture-account-a', 'session');
  const { connectReading } = await import('../src/service.js');
  const other = connectReading(createDailyState(storage), { storage });
  other.setToken('fixture-account-b');
  const sessionStorage = { getItem: key => session.get(key) ?? null };
  const reopened = connectReading(createDailyState(storage), { storage, sessionStorage });
  assert.equal(reopened.token(), '');
  await assert.rejects(reopened.pick(), /token/i);
});
