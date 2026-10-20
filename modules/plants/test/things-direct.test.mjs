import assert from 'node:assert/strict';
import test from 'node:test';
import { loadModule } from '../../../tests/support/load-module.mjs';

const things = await loadModule('plants', 'integrations/things.js');
const copy = { watering: 'Watering', soil: 'Soil change', fertilizer: 'Fertilizer' };

test('direct Things URL sends every reminder with its care type, original due date and Unicode plant name', () => {
  const reminders = ['watering', 'soil', 'fertilizer'].map(type => ({ plant: { name: 'Teléfono — Raúl 🌱' }, type, info: { nextDue: '2026-07-30' } }));
  const url = new URL(things.buildThingsRemindersURL(reminders, copy));
  assert.equal(url.protocol, 'things:');
  assert.equal(url.pathname, '/json');
  assert.deepEqual(JSON.parse(url.searchParams.get('data')), reminders.map(item => ({ type: 'to-do', attributes: { title: `${copy[item.type]} — ${item.plant.name}`, when: '2026-07-30' } })));
  assert.equal(url.searchParams.has('auth-token'), false);
});

test('direct Things URL follows interface language and never changes reminder records', () => {
  const reminders = [{ plant: { name: 'My fern' }, type: 'watering', info: { nextDue: '2026-10-20' } }];
  const before = structuredClone(reminders);
  const url = new URL(things.buildThingsRemindersURL(reminders, { watering: 'Riego' }));
  assert.equal(JSON.parse(url.searchParams.get('data'))[0].attributes.title, 'Riego — My fern');
  assert.deepEqual(reminders, before);
});

test('direct Things URL does not launch an empty import', () => {
  assert.equal(things.buildThingsRemindersURL([], copy), null);
});
