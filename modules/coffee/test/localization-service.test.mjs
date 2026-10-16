import test from 'node:test';
import assert from 'node:assert/strict';
import { dictionaries, translateMessage } from '../src/backend/core/i18n.js';

test('coffee dictionaries cover shared errors and preserve user text in either language', () => {
  assert.deepEqual(Object.keys(dictionaries.en).sort(), Object.keys(dictionaries.es).sort());
  const messages = [
    'Data changed in another view.', 'Duplicate coffee record ids.',
    'Entry references a missing bean.', 'Invalid coffee data.',
    'Unknown coffee import preview.', 'Entry fields must be objects.',
    'Entry requires a valid brewed date.',
  ];
  for (const message of messages) {
    assert.equal(translateMessage('en', message), message);
    assert.notEqual(translateMessage('es', message), message);
  }
  for (const language of ['en', 'es']) {
    assert.equal(translateMessage(language, 'Café de mamá ☕'), 'Café de mamá ☕');
  }
  for (const key of Object.keys(dictionaries.en)) {
    const parameters = value => [...value.matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort();
    assert.deepEqual(parameters(dictionaries.es[key]), parameters(dictionaries.en[key]), key);
  }
});
