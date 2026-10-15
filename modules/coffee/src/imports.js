import { prepareImport } from './backend/features/importExport.js';
import { validateCoffee, validateCoffeeRecords } from './validation.js';
import { DataConflictError } from '../../../packages/data/src/errors.js';

export function coffeeImports(state, adapter) {
  const previews = new WeakSet();
  function previewImport(text, mode = 'merge') {
    const current = state.read().value;
    const data = prepareImport(JSON.parse(text), { mode, current: adapter.read() });
    data.settings.language = current.preferences.language;
    const errors = validateCoffeeRecords(data);
    if (errors.length) throw new Error(errors.join(' '));
    if (!validateCoffee(data)) throw new Error('Invalid coffee data.');
    const preview = { mode, data, counts: { beans: data.beanPresets.length, entries: data.entries.length }, expected: JSON.stringify(current) };
    previews.add(preview);
    return preview;
  }
  function applyImport(preview) {
    if (!previews.has(preview)) throw new Error('Unknown coffee import preview.');
    if (JSON.stringify(state.read().value) !== preview.expected) throw new DataConflictError();
    adapter.save(preview.data);
    previews.delete(preview);
  }
  return { previewImport, applyImport, exportRecovery: () => JSON.stringify(state.read().value, null, 2) };
}
