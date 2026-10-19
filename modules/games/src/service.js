import { createModuleStore } from '../../../packages/data/src/module-store.js';
import { createEmptyData, normalizeData } from './backend/core/schema.js';
import { bindGameStorage } from './backend/core/storage.js';
import { validateActivities } from '../../../packages/platform/src/activity-types.js';
import { DataConflictError } from '../../../packages/data/src/errors.js';
import { validGames } from './validation.js';
import { synchronizeGameActivities } from './activity-sync.js';
import { gameImports } from './imports.js';

const revision = Symbol('game document revision');
function fingerprint(root) { return JSON.stringify(root.modules.games ?? null); }
export function connectGames(state) {
  const store = createModuleStore(state, { id: 'games', version: 1, initial: createEmptyData, validate: validGames });
  const activities = createModuleStore(state, { id: 'activities', version: 1, initial: () => [], validate: validateActivities });
  function read() {
    const data = store.read();
    const root = state.read().value;
    return { ...data, settings: { ...data.settings, language: root.preferences.language }, [revision]: fingerprint(root) };
  }
  function save(data, options = {}) {
    const normalized = normalizeData(data);
    if (!validGames(normalized)) throw new Error('Invalid game data.');
    state.commit(current => {
      store.read();
      if (!options.replace && data[revision] !== fingerprint(current)) throw new DataConflictError();
      const language = options.language ?? current.preferences.language;
      const value = { ...normalized, settings: { ...normalized.settings, language } };
      if (!validGames(value)) throw new Error('Invalid game settings.');
      const running = synchronizeGameActivities(activities.read(), value, options);
      return {
        ...current, preferences: { ...current.preferences, language },
        modules: { ...current.modules, games: { version: 1, data: value }, activities: { version: 1, data: running } },
      };
    });
    return read();
  }
  const replace = data => save(data, { replace: true });
  const stop = bindGameStorage({ read, save, replace });
  return { read, stop, ...gameImports(state, { replace }) };
}
