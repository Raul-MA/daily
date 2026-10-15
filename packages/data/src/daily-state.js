import { createDocumentStore } from './document-store.js';
import { initialDailyDocument, validateDailyDocument } from './daily-document.js';
export const DAILY_KEY = 'daily:v1';
export function createDailyState(storage, language = 'en') {
    const store = createDocumentStore({ storage, key: DAILY_KEY, validate: validateDailyDocument, initial: () => initialDailyDocument(language) });
    const listeners = new Set();
    function commit(transform) {
        const next = store.save(transform(store.load().value));
        for (const listener of listeners)
            listener();
        return next;
    }
    function updatePreferences(patch) {
        return commit(current => ({ ...current, preferences: { ...current.preferences, ...patch } })).preferences;
    }
    function subscribe(listener) {
        listeners.add(listener);
        return () => { listeners.delete(listener); };
    }
    return { read: store.load, updatePreferences, subscribe, commit };
}
