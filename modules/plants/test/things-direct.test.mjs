import assert from 'node:assert/strict';
import test from 'node:test';
import { loadModule } from '../../../tests/support/load-module.mjs';

const things = await loadModule('plants', 'integrations/things.js');
const copy = { watering: 'Watering', soil: 'Soil change', fertilizer: 'Fertilizer', next: 'Next' };

test('direct Things URL sends every reminder with its care type, original due date and Unicode plant name', () => {
  const reminders = ['watering', 'soil', 'fertilizer'].map(type => ({ plant: { name: 'Teléfono — Raúl 🌱' }, type, info: { nextDue: '2026-07-30' } }));
  const url = new URL(things.buildThingsRemindersURL(reminders, copy));
  assert.equal(url.protocol, 'things:');
  assert.equal(url.pathname, '/json');
  assert.deepEqual(JSON.parse(url.searchParams.get('data')), reminders.map(item => ({ type: 'to-do', attributes: { title: `${copy[item.type]} — ${item.plant.name}`, when: '2026-07-30', notes: 'Next: 2026-07-30', list: 'Plantas' } })));
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

test('bulk Things import includes full notes, exact dates and saved project without form encoding', () => {
  const plant = { name: 'Ficus + fern 🌱', species: 'Ficus lyrata', location: 'Sala', notes: 'Check A+B & moisture.\nKeep spaces.' };
  const reminders = [{ plant, type: 'watering', info: { nextDue: '2099-11-07' } }];
  const before = structuredClone(reminders);
  const text = { ...copy, species: 'Scientific name', location: 'Location', notes: 'Notes', thingsCheck: 'Check the plant first.' };
  const raw = things.buildThingsRemindersURL(reminders, text, 'Casa 🏡');
  assert.equal(raw.includes('+'), false);
  const url = new URL(raw);
  const [item] = JSON.parse(decodeURIComponent(url.search.slice(6).split('&')[0]));
  assert.equal(item.attributes.list, 'Casa 🏡');
  assert.equal(item.attributes.when, '2099-11-07');
  assert.equal(item.attributes.title, 'Watering — Ficus + fern 🌱');
  assert.equal(item.attributes.notes, 'Scientific name: Ficus lyrata\n\nLocation: Sala\n\nNext: 2099-11-07\n\nCheck the plant first.\n\nNotes:\nCheck A+B & moisture.\nKeep spaces.');
  assert.deepEqual(reminders, before);
});
