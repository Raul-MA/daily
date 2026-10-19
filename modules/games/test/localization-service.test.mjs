import test from 'node:test';
import assert from 'node:assert/strict';
import { dictionaries, getAvailableLanguages, translate, translateMessage } from '../src/backend/core/i18n.js';

test('games translations preserve interpolation and user names while covering scoring and errors', () => {
  assert.deepEqual(getAvailableLanguages(), ['en', 'es']);
  assert.equal(translate('es', 'Winner: {name}', { name: 'Play' }), 'Ganador: Play');
  assert.equal(translate('en', 'Winner: {name}', { name: 'Play' }), 'Winner: Play');
  for (const source of ['Highest score after rounds', 'First to points', 'Win / loss / tie', 'Choose at least two players.', 'Data changed in another view.']) {
    assert.equal(translateMessage('en', source), source);
    assert.notEqual(translateMessage('es', source), source);
  }
  assert.equal(translateMessage('es', 'Mi mesa 🧩'), 'Mi mesa 🧩');
  assert.equal(translateMessage('es', 'Backup session 1 round 2 scores must be whole numbers.'), 'Sesión de la copia 1 ronda 2: las puntuaciones deben ser números enteros.');
  assert.deepEqual(Object.keys(dictionaries.en).sort(), Object.keys(dictionaries.es).sort());
  for (const key of Object.keys(dictionaries.en)) {
    const parameters = text => [...text.matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort();
    assert.deepEqual(parameters(dictionaries.es[key]), parameters(dictionaries.en[key]), key);
  }
});
