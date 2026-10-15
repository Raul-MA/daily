import { createModuleStore } from '../../../packages/data/src/module-store.js';
import { bindCoffeeStorage } from './backend/core/storage.js';
import { createEmptyData } from './backend/core/schema.js';
import { validateCoffee, validateCoffeeRecords } from './validation.js';
import { coffeeImports } from './imports.js';

export function connectCoffee(state) {
  const options = { id: 'coffee', version: 1, initial: createEmptyData, validate: validateCoffee };
  const store = createModuleStore(state, options);
  function read() {
    const data = store.read();
    return { ...data, settings: { ...data.settings, language: state.read().value.preferences.language } };
  }
  function save(data, language) {
    const errors = validateCoffeeRecords(data);
    if (errors.length) throw new Error(errors.join(' '));
    state.commit(current => {
      store.read();
      const locale = language ?? current.preferences.language;
      const value = { ...data, settings: { ...data.settings, language: locale } };
      if (!validateCoffee(value)) throw new Error('Invalid coffee data.');
      return {
        ...current, preferences: { ...current.preferences, language: locale },
        modules: { ...current.modules, coffee: { version: 1, data: value } },
      };
    });
  }
  const stop = bindCoffeeStorage({ read, save });
  return { read, stop, ...coffeeImports(state, { read, save }) };
}
