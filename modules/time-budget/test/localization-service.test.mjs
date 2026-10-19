import { createHash } from 'node:crypto';
import { template } from '../src/template.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { createTimeApp } from '../src/app.js';
import { dictionaries, translate } from '../src/i18n.js';
import { createDailyState } from '../../../packages/data/src/daily-state.js';
import { connectTimeBudget } from '../src/service.js';

test('time budget dictionaries retain interpolation and literal task names', () => {
  assert.deepEqual(Object.keys(dictionaries.en).sort(), Object.keys(dictionaries.es).sort());
  assert.equal(createHash('sha256').update(template('en')).digest('hex'), 'f95b39baab06f0e3821272e39e9fdf9605b6f069c217bdec0de1129e412bb30f');
  assert.ok(template('es').includes('Haz que cada minuto cuente.'));
  assert.ok(!template('es').includes('[['));
  const app = createTimeApp({ language: 'es' });
  assert.equal(app.copy('Start focus'), 'Iniciar enfoque');
  assert.equal(translate('es', 'Edit {name}', { name: 'Free time remaining 🌱' }), 'Editar Free time remaining 🌱');
  for (const key of Object.keys(dictionaries.en)) {
    const parameters = text => [...text.matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort();
    assert.deepEqual(parameters(dictionaries.es[key]), parameters(dictionaries.en[key]), key);
  }
});

test('time budget reads its shared language without initializing or changing a session', () => {
  const values = new Map();
  const state = createDailyState({ getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) });
  const service = connectTimeBudget(state);
  assert.equal(service.language(), 'en');
  assert.equal(values.size, 0);
  state.updatePreferences({ language: 'es' });
  const before = [...values];
  assert.equal(service.language(), 'es');
  assert.deepEqual(service.read().templates, {});
  assert.equal(service.read().session, null);
  assert.deepEqual([...values], before);
  assert.deepEqual(state.read().value.modules, {});
});
