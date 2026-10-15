import test from 'node:test';
import assert from 'node:assert/strict';
import { loadModule } from '../../../tests/support/load-module.mjs';

const load = path => loadModule('coffee', `backend/${path}`);

async function setup(t) {
  const previous = process.env.TZ;
  process.env.TZ = 'UTC';
  t.after(() => { if (previous === undefined) delete process.env.TZ; else process.env.TZ = previous; });
  const values = new Map();
  globalThis.localStorage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
  const schema = await load('core/schema.js');
  const entries = await load('features/entries.js');
  const beans = await load('features/beans.js');
  const settings = await load('features/settings.js');
  const backups = await load('features/importExport.js');
  const insights = await load('features/insights.js');
  const bean = beans.createBeanPreset({ brand: 'Casa ☕', blend: 'Natural', decaf: false, roastOrigin: 'México' });
  return { values, schema, entries, beans, settings, backups, insights, bean };
}

function payload(bean, overrides = {}) {
  return { meta: { beanPresetId: bean.id, brewedAt: '2026-01-10T12:00:00Z', roastDate: '2026-01-03' }, grind: { doseG: 18, grindSetting: 14.2 }, brew: { yieldValue: 42, yieldUnit: 'g', shotTimeSeconds: 29 }, taste: { overallScore: 8, tastingNotes: 'Azúcar 🌱' }, ...overrides };
}

test('coffee entries preserve numeric ratios roast age and Unicode through a storage reload', async t => {
  const { bean, entries, backups } = await setup(t);
  const item = entries.createEntry(payload(bean));
  assert.equal(item.brew.ratio, 2.33);
  assert.equal(item.meta.daysOffRoast, 7);
  assert.equal(item.brew.drinkType, 'espresso');
  assert.equal(entries.getEntry(item.id).taste.tastingNotes, 'Azúcar 🌱');
  assert.equal(backups.exportAll().entries[0].id, item.id);
});

test('drink type changes calculate composition and clear irrelevant water and milk fields', async t => {
  const { bean, entries } = await setup(t);
  const item = entries.createEntry(payload(bean, { brew: { drinkType: 'americano', yieldValue: 42, yieldUnit: 'ml', waterMl: 120 } }));
  assert.equal(item.brew.compositionRatio, 2.86);
  const milk = entries.updateEntry(item.id, { brew: { drinkType: 'cappuccino', milkMl: 130, milkBrand: 'Casa', milkType: 'whole' } });
  assert.equal(milk.brew.compositionRatio, 3.1);
  assert.equal(milk.brew.waterMl, null);
  const espresso = entries.updateEntry(item.id, { brew: { drinkType: 'espresso' } });
  assert.equal(espresso.brew.milkMl, null);
  assert.equal(espresso.brew.milkBrand, '');
  assert.equal(espresso.brew.compositionRatio, null);
});

test('partial drink edits preserve identity while explicit skipped tastes and false tools remain explicit', async t => {
  const { bean, entries } = await setup(t);
  const original = entries.createEntry(payload(bean, { taste: { sweetness: 'high', overallScore: 8 } }));
  const changed = entries.updateEntry(original.id, { prep: { wdtUsed: false }, taste: { sweetness: null, overallScore: '' } });
  assert.equal(changed.id, original.id);
  assert.equal(changed.createdAt, original.createdAt);
  assert.equal(changed.prep.wdtUsed, false);
  assert.equal(changed.taste.sweetness, null);
  assert.equal(changed.taste.overallScore, null);
  assert.equal(changed.brew.ratio, 2.33);
});

test('beans referenced by drinks cannot be deleted while unused beans can be removed', async t => {
  const { bean, beans, entries } = await setup(t);
  const item = entries.createEntry(payload(bean));
  assert.throws(() => beans.deleteBeanPreset(bean.id), /used by entries/);
  entries.deleteEntry(item.id);
  beans.deleteBeanPreset(bean.id);
  assert.equal(beans.getBeanPresets().length, 0);
});

test('coffee filters and insights retain scored and unscored drink semantics', async t => {
  const { bean, entries, insights } = await setup(t);
  const low = entries.createEntry({ ...payload(bean), id: 'low', taste: { overallScore: 4 } });
  const high = entries.createEntry({ ...payload(bean), id: 'high', taste: { overallScore: 9 } });
  entries.createEntry({ ...payload(bean), id: 'none', taste: { overallScore: '' } });
  assert.deepEqual(entries.filterEntries({ scoreMin: 8 }).map(item => item.id), [high.id]);
  assert.equal(entries.sortEntries([high, low], 'scoreAsc')[0].id, low.id);
  const result = insights.getInsights();
  assert.equal(result.totalEntries, 3);
  assert.equal(result.scoredEntries, 2);
  assert.equal(result.bestEntry.id, high.id);
  assert.equal(result.bestBean.brand, bean.brand);
});

test('legacy coffee merge imports retain tool setup and combine explicitly provided tool settings', async t => {
  const { schema, settings, backups } = await setup(t);
  settings.updateSettings({ toolsConfigured: true, tools: { wdt: true, distributor: false, puckScreen: true } });
  const incoming = { ...schema.createEmptyData(), settings: { theme: 'system' } };
  backups.importAll(incoming);
  assert.deepEqual(settings.getSettings().tools, { wdt: true, distributor: false, puckScreen: true });
  backups.importAll({ ...incoming, settings: { tools: { distributor: true } } });
  assert.deepEqual(settings.getSettings().tools, { wdt: true, distributor: true, puckScreen: true });
  assert.equal(settings.getSettings().toolsConfigured, true);
});

test('legacy replacement resets setup and normalizes absent drink composition fields', async t => {
  const { bean, schema, entries, settings, backups } = await setup(t);
  const item = entries.createEntry(payload(bean));
  delete item.brew.drinkType;
  delete item.brew.compositionRatio;
  const incoming = { ...schema.createEmptyData(), beanPresets: [bean], entries: [item], settings: { theme: 'system' } };
  settings.updateSettings({ toolsConfigured: true });
  backups.importAll(incoming, { mode: 'replace' });
  assert.equal(settings.getSettings().toolsConfigured, false);
  assert.equal(entries.getEntry(item.id).brew.drinkType, 'espresso');
  assert.equal(entries.getEntry(item.id).brew.compositionRatio, null);
});

test('unsupported coffee backups and invalid bean input leave existing records unchanged', async t => {
  const { beans, backups, values } = await setup(t);
  const before = [...values];
  assert.throws(() => backups.importAll({ schemaVersion: 99, entries: [], beanPresets: [] }), /Unsupported schema/);
  assert.deepEqual([...values], before);
  assert.throws(() => beans.createBeanPreset({ brand: '', blend: '' }));
  assert.deepEqual([...values], before);
});
