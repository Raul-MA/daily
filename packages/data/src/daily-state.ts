import { createDocumentStore } from './document-store.ts';
import { initialDailyDocument, validateDailyDocument } from './daily-document.ts';
import type { DailyDocument, Language, Preferences } from './daily-document.ts';

export const DAILY_KEY = 'daily:v1';

export function createDailyState(storage: Pick<Storage, 'getItem' | 'setItem'>, language: Language = 'en') {
  const store = createDocumentStore({ storage, key: DAILY_KEY, validate: validateDailyDocument, initial: () => initialDailyDocument(language) });
  const listeners = new Set<() => void>();
  function commit(transform: (current: DailyDocument) => DailyDocument) {
    const next = store.save(transform(store.load().value));
    for (const listener of listeners) listener();
    return next;
  }
  function updatePreferences(patch: Partial<Preferences>) {
    return commit(current => ({ ...current, preferences: { ...current.preferences, ...patch } })).preferences;
  }
  function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  }
  return { read: store.load, updatePreferences, subscribe, commit };
}
export type DailyState = ReturnType<typeof createDailyState>;
