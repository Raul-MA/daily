import test from 'node:test';
import assert from 'node:assert/strict';
import { createDailyState } from '../../../packages/data/src/daily-state.js';
import * as beans from '../src/backend/features/beans.js';
import * as entries from '../src/backend/features/entries.js';
import * as settings from '../src/backend/features/settings.js';
import * as backups from '../src/backend/features/importExport.js';

async function setup(t) {
  const { connectCoffee } = await import('../src/service.js');
  const values = new Map();
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  const state = createDailyState(storage);
  const service = connectCoffee(state);
  t.after(service.stop);
  return { values, storage, state, service };
}
const beanInput = { brand: 'Café ☕', blend: 'Casa', decaf: false };
function drink(beanId) { return { meta: { beanPresetId: beanId }, brew: { yieldUnit: 'g', yieldValue: 36 }, grind: { doseG: 18 } }; }

test('coffee reads create no records and saves preserve unrelated shared modules', async t => {
  const { values, state } = await setup(t);
  assert.deepEqual(beans.getBeanPresets(), []);
  assert.deepEqual(entries.getEntries(), []);
  assert.equal(values.size, 0);
  state.commit(current => ({ ...current, modules: { plants: { version: 1, data: ['Keep'] } } }));
  const bean = beans.createBeanPreset(beanInput);
  const item = entries.createEntry(drink(bean.id));
  assert.equal(state.read().value.modules.coffee.data.entries[0].id, item.id);
  assert.deepEqual(state.read().value.modules.plants.data, ['Keep']);
  assert.ok([...values.keys()].every(key => key.startsWith('daily:v1')));
});

test('explicit coffee language changes commit with global language atomically', async t => {
  const { state } = await setup(t);
  const observed = [];
  state.subscribe(() => observed.push(state.read().value));
  settings.updateSettings({ language: 'es', theme: 'dark' });
  assert.equal(observed.length, 1);
  assert.equal(observed[0].preferences.language, 'es');
  assert.equal(observed[0].modules.coffee.data.settings.language, 'es');
  state.updatePreferences({ language: 'en' });
  assert.equal(settings.getSettings().language, 'en');
  assert.equal(backups.exportAll().settings.language, 'en');
});

test('coffee imports preserve shared language and validate merged bean references', async t => {
  const { state } = await setup(t);
  const bean = beans.createBeanPreset(beanInput);
  const item = entries.createEntry(drink(bean.id));
  const incoming = { ...backups.exportAll(), beanPresets: [], entries: [{ ...item, id: 'imported' }], settings: { language: 'es' } };
  backups.importAll(incoming);
  assert.equal(entries.getEntries().length, 2);
  assert.equal(state.read().value.preferences.language, 'en');
  assert.equal(settings.getSettings().language, 'en');
  assert.throws(() => backups.importAll(incoming, { mode: 'replace' }), /reference|bean/i);
  assert.equal(entries.getEntries().length, 2);
});

test('coffee duplicate ids broken references and future versions fail without mutation', async t => {
  const { values } = await setup(t);
  const bean = beans.createBeanPreset(beanInput);
  const item = entries.createEntry(drink(bean.id));
  const incoming = backups.exportAll();
  const before = [...values];
  for (const value of [
    { ...incoming, beanPresets: [bean, bean] }, { ...incoming, entries: [item, item] },
    { ...incoming, entries: [{ ...item, meta: { ...item.meta, beanPresetId: 'missing' } }] },
    { ...incoming, schemaVersion: 99 },
  ]) {
    assert.throws(() => backups.importAll(value));
    assert.deepEqual([...values], before);
  }
});

test('coffee quota failures retain the previous drink and emit no successful change', async t => {
  const { storage, state } = await setup(t);
  const bean = beans.createBeanPreset(beanInput);
  const item = entries.createEntry(drink(bean.id));
  let events = 0;
  state.subscribe(() => events++);
  storage.setItem = () => { throw new Error('QuotaExceededError'); };
  assert.throws(() => entries.updateEntry(item.id, { taste: { overallScore: 9 } }), /QuotaExceeded/);
  assert.equal(entries.getEntry(item.id).taste.overallScore, null);
  assert.equal(events, 0);
});

test('coffee rejects a future module payload without silently replacing it', async t => {
  const { state, values } = await setup(t);
  state.commit(current => ({ ...current, modules: { coffee: { version: 99, data: {} } } }));
  const before = [...values];
  assert.throws(() => beans.getBeanPresets(), /version/i);
  assert.throws(() => beans.createBeanPreset(beanInput), /version/i);
  assert.deepEqual([...values], before);
});

test('coffee import previews are read-only and cancel leaves the current root intact', async t => {
  const { service, values } = await setup(t);
  beans.createBeanPreset(beanInput);
  const before = [...values];
  const preview = service.previewImport(JSON.stringify(backups.exportAll()), 'replace');
  assert.deepEqual(preview.counts, { beans: 1, entries: 0 });
  assert.equal(preview.mode, 'replace');
  assert.deepEqual([...values], before);
  assert.throws(() => service.previewImport('{bad', 'replace'));
  assert.deepEqual([...values], before);
});

test('coffee import confirmation rejects stale previews and retains recovery on replacement', async t => {
  const { service, state, values } = await setup(t);
  beans.createBeanPreset(beanInput);
  const preview = service.previewImport(JSON.stringify(backups.exportAll()), 'replace');
  beans.createBeanPreset({ ...beanInput, blend: 'Other' });
  assert.throws(() => service.applyImport(preview), /changed/i);
  const before = state.read().value;
  service.applyImport(service.previewImport(JSON.stringify(preview.data), 'replace'));
  assert.equal(beans.getBeanPresets().length, 1);
  assert.deepEqual(JSON.parse(values.get('daily:v1:recovery')), before);
});

test('coffee malformed nested records and invalid settings fail before any shared write', async t => {
  const { service, values } = await setup(t);
  const bean = beans.createBeanPreset(beanInput);
  entries.createEntry(drink(bean.id));
  const data = backups.exportAll();
  const before = [...values];
  for (const group of ['prep', 'grind', 'visual', 'taste', 'brew', 'meta']) {
    const malformed = { ...data, entries: [{ ...data.entries[0], [group]: null }] };
    assert.throws(() => service.previewImport(JSON.stringify(malformed), 'replace'));
    assert.deepEqual([...values], before);
  }
  for (const patch of [{ theme: 'unsupported' }, { tools: { wdt: 'yes' } }, { language: 'zz' }]) {
    assert.throws(() => settings.updateSettings(patch));
    assert.deepEqual([...values], before);
  }
});

test('coffee first tools setup saves its starter bean and settings in one root commit', async t => {
  const { state } = await setup(t);
  const api = await import('../src/backend/features/setup.js');
  const observed = [];
  state.subscribe(() => observed.push(state.read().value));
  api.completeToolSetup({ wdt: true, distributor: false, puckScreen: false });
  assert.equal(observed.length, 1);
  assert.equal(observed[0].modules.coffee.data.settings.toolsConfigured, true);
  assert.equal(observed[0].modules.coffee.data.beanPresets.length, 1);
  const first = beans.getBeanPresets();
  api.completeToolSetup({ wdt: false, distributor: false, puckScreen: false });
  assert.deepEqual(beans.getBeanPresets(), first);
});

test('coffee first tools setup quota failure leaves no starter bean or configured flag', async t => {
  const { storage, state } = await setup(t);
  const api = await import('../src/backend/features/setup.js');
  const before = state.read().value;
  let events = 0;
  state.subscribe(() => events++);
  storage.setItem = () => { throw new Error('QuotaExceededError'); };
  assert.throws(() => api.completeToolSetup({ wdt: false, distributor: false, puckScreen: false }), /QuotaExceeded/);
  assert.deepEqual(state.read().value, before);
  assert.equal(events, 0);
});
