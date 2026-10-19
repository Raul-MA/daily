import { createModuleStore } from '../../../packages/data/src/module-store.js';
import { DataConflictError } from '../../../packages/data/src/errors.js';
import { initialWhatsApp, validWhatsApp } from './validation.js';
import { whatsappImports } from './imports.js';

const revision = Symbol('WhatsApp revision');
function fingerprint(root) { return JSON.stringify(root.modules.whatsapp ?? null); }
export function connectWhatsApp(state) {
  const store = createModuleStore(state, { id: 'whatsapp', version: 1, initial: initialWhatsApp, validate: validWhatsApp });
  function read() { return { ...store.read(), [revision]: fingerprint(state.read().value) }; }
  function saveDraft(draft, expected) {
    if (!validWhatsApp({ draft })) throw new Error('Invalid WhatsApp draft.');
    state.commit(root => {
      store.read();
      if (expected?.[revision] !== fingerprint(root)) throw new DataConflictError();
      return { ...root, modules: { ...root.modules, whatsapp: { version: 1, data: { draft } } } };
    });
    return read();
  }
  return { read, saveDraft, clearDraft: expected => saveDraft(null, expected), ...whatsappImports(state, { read, saveDraft }), stop: () => undefined };
}
