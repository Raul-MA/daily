import { createModuleStore } from '../../../packages/data/src/module-store.js';
import { DataConflictError } from '../../../packages/data/src/errors.js';
import { createReaderDomain } from './domain.js';
import { createCredentials } from './credentials.js';
import { initialReading, validReadingData } from './validation.js';
import { readingActions } from './service-actions.js';

const revision = Symbol('Reader revision');
function fingerprint(root) { return JSON.stringify(root.modules.reading ?? null); }
export function connectReading(state, options = {}) {
  const store = createModuleStore(state, { id: 'reading', version: 1, initial: initialReading, validate: validReadingData });
  const domain = createReaderDomain(options);
  const credentials = createCredentials(options);
  const listeners = new Set();
  let pending = null;
  function read() { return { ...store.read(), [revision]: fingerprint(state.read().value) }; }
  function cancel() { pending?.abort(); pending = null; }
  function emit() { for (const listener of listeners) listener(); }
  function save(data) {
    if (!validReadingData(data)) throw new Error('Invalid Reader data.');
    state.commit(root => {
      store.read();
      if (data[revision] !== fingerprint(root)) throw new DataConflictError();
      return { ...root, modules: { ...root.modules, reading: { version: 1, data: JSON.parse(JSON.stringify(data)) } } };
    });
    cancel();
    emit();
    return read();
  }
  function clearAccount() {
    cancel();
    domain.clearCache();
    const data = read();
    if (data.picks || data.lastItem) save({ ...data, picks: null, lastItem: null });
  }
  function setToken(token, mode = 'memory') {
    if (token.trim() !== credentials.token()) clearAccount();
    credentials.set(token, mode);
    emit();
  }
  function forgetToken() { clearAccount(); credentials.set('', 'memory'); emit(); }
  function begin() { cancel(); pending = new AbortController(); return pending; }
  const core = { read, save, domain, credentials, emit, begin, now: options.now ?? (() => Date.now()) };
  return {
    read, save, setToken, forgetToken, token: credentials.token, credentialMode: credentials.mode,
    domain, ...readingActions(core), stop: cancel,
    subscribe: listener => { listeners.add(listener); return () => listeners.delete(listener); },
  };
}
