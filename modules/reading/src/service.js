import { guardAccount } from './account-epoch.js';
import { readingImports } from './imports.js';
import { readingCredentials } from './service-credentials.js';
import { createReviewService } from './review/service.js';
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
  const credentials = guardAccount(createCredentials(options), options.storage ?? globalThis.localStorage);
  const cacheOptions = { ...options, cacheStorage: options.sessionStorage ?? globalThis.sessionStorage, accountId: credentials.accountId };
  const domain = createReaderDomain(cacheOptions);
  const listeners = new Set();
  const pending = new Map();
  function read() { return { ...store.read(), [revision]: fingerprint(state.read().value) }; }
  function cancel() { for (const controller of pending.values()) controller.abort(); pending.clear(); }
  function emit() { for (const listener of listeners) listener(); }
  function save(data) {
    if (!validReadingData(data)) throw new Error('Invalid Reader data.');
    const changed = JSON.stringify(store.read().settings) !== JSON.stringify(data.settings);
    state.commit(root => {
      store.read();
      if (data[revision] !== fingerprint(root)) throw new DataConflictError();
      return { ...root, modules: { ...root.modules, reading: { version: 1, data: JSON.parse(JSON.stringify(data)) } } };
    });
    if (changed) cancel();
    emit();
    return read();
  }
  const review = createReviewService({ ...cacheOptions, token: credentials.token, emit });
  const account = readingCredentials({ read, save, cancel, domain, review, credentials, emit });
  function begin(kind = 'pick') { pending.get(kind)?.abort(); const controller = new AbortController(); pending.set(kind, controller); return controller; }
  const core = { read, save, domain, credentials, emit, begin, now: options.now ?? (() => Date.now()) };
  return {
    read, save, ...account, ...readingImports(state, { read, save, releaseCredentials: account.releaseCredentials }), token: credentials.token, credentialMode: credentials.mode,
    domain, review, ...readingActions(core), stop: () => { cancel(); review.stop(); },
    subscribe: listener => { listeners.add(listener); return () => listeners.delete(listener); },
  };
}
