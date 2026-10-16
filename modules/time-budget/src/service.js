import { createCountdowns } from './countdowns.js';
import { createModuleStore } from '../../../packages/data/src/module-store.js';
import { DataConflictError } from '../../../packages/data/src/errors.js';
import { validateActivities } from '../../../packages/platform/src/activity-types.js';
import { validBudget, initialBudget } from './validation.js';
import { synchronizeBudgetActivities } from './activity-sync.js';
import { budgetImports } from './imports.js';

const revision = Symbol('time budget revision');
function fingerprint(root) { return JSON.stringify(root.modules['time-budget'] ?? null); }
export function connectTimeBudget(state) {
  const store = createModuleStore(state, { id: 'time-budget', version: 1, initial: initialBudget, validate: validBudget });
  const activities = createModuleStore(state, { id: 'activities', version: 1, initial: () => [], validate: validateActivities });
  function read() { return { ...store.read(), [revision]: fingerprint(state.read().value) }; }
  function save(data, replace = false, countdowns) {
    const normalized = JSON.parse(JSON.stringify(data));
    if (!validBudget(normalized)) throw new Error('Invalid Time Budget data.');
    state.commit(current => {
      store.read();
      if (!replace && data[revision] !== fingerprint(current)) throw new DataConflictError();
      const running = synchronizeBudgetActivities(activityBase(activities.read(), countdowns), normalized.session, replace);
      return { ...current, modules: { ...current.modules, 'time-budget': { version: 1, data: normalized }, activities: { version: 1, data: running } } };
    });
    return read();
  }
  const service = { language: () => state.read().value.preferences.language, countdowns: createCountdowns(state), read, save, replace: (data, countdowns) => save(data, true, countdowns), stop: () => undefined };
  return { ...service, ...budgetImports(state, service) };
}
function activityBase(existing, countdowns) {
  if (countdowns === undefined) return existing;
  if (!validateActivities(countdowns) || countdowns.some(item => item.kind !== 'countdown')) throw new Error('Invalid countdown backup.');
  return [...existing.filter(item => item.kind !== 'countdown'), ...countdowns];
}
