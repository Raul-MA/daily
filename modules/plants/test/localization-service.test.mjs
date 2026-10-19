import test from 'node:test';
import assert from 'node:assert/strict';
import { PLANT_TEMPLATES } from '../src/plants/plant-templates.js';

async function templates(language) { return (await import('../src/plants/localized.js')).plantTemplates(language); }
function numbers(text) { return text.match(/\d+/g) ?? []; }

test('all thirteen authored plant guides and template notes have complete English and Spanish text with unchanged care figures', async () => {
  const english = await templates('en');
  const spanish = await templates('es');
  assert.equal(english.length, 13);
  assert.deepEqual(english.map(item => item.id), PLANT_TEMPLATES.map(item => item.id));
  assert.equal(spanish.find(item => item.id === 'lucky-bamboo').label, 'Bambú de la suerte (en tierra)');
  assert.equal(english.find(item => item.id === 'lucky-bamboo').label, 'Lucky Bamboo (in soil)');
  for (const source of PLANT_TEMPLATES) {
    const en = english.find(item => item.id === source.id);
    const es = spanish.find(item => item.id === source.id);
    assert.equal(en.species, source.species);
    assert.equal(en.difficulty, source.difficulty);
    assert.deepEqual(en.schedule, source.schedule);
    assert.deepEqual(es.schedule, source.schedule);
    assert.equal(es.notes, source.notes);
    assert.deepEqual(es.guide, source.guide);
    assert.ok(en.label.length > 0);
    assert.ok(en.notes.length > 20);
    assert.notEqual(en.notes, source.notes);
    assert.deepEqual(numbers(en.notes), numbers(source.notes));
    for (const field of ['water', 'soil', 'fertilizer', 'light', 'humidity']) {
      assert.equal(typeof en.guide[field], 'string');
      assert.ok(en.guide[field].length > 20);
      assert.notEqual(en.guide[field], source.guide[field]);
      assert.deepEqual(numbers(en.guide[field]), numbers(source.guide[field]));
    }
    assert.equal(en.guide.alerts.length, source.guide.alerts.length);
    en.guide.alerts.forEach((alert, index) => { assert.ok(alert.length > 10); assert.notEqual(alert, source.guide.alerts[index]); assert.deepEqual(numbers(alert), numbers(source.guide.alerts[index])); });
  }
});

test('localized plant templates are detached copies and never rewrite original source notes guides or schedules', async () => {
  const before = JSON.stringify(PLANT_TEMPLATES);
  const english = await templates('en');
  const expected = structuredClone(english);
  english[0].notes = 'Changed';
  english[0].guide.water = 'Changed';
  english[0].guide.alerts.push('Changed');
  english[0].schedule.wateringSeasons[0].intervalDays = 1;
  assert.equal(JSON.stringify(PLANT_TEMPLATES), before);
  assert.deepEqual(await templates('en'), expected);
  assert.deepEqual(await templates('es'), await templates('unknown'));
});
