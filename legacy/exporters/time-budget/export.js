import { validBudget } from './validation.js';

function read(storage, key, fallback) {
  const raw = storage.getItem(key);
  return raw === null ? fallback : JSON.parse(raw);
}
function fields(value, names) { return Object.fromEntries(names.map(name => [name, value[name]])); }
function cleanSession(value) {
  if (value === null) return null;
  return { ...fields(value, ['id', 'goalTime', 'startTime', 'currentTaskIndex', 'timerElapsed', 'timerRunning', 'timerStartTime']),
    tasks: value.tasks.map(task => fields(task, ['id', 'name', 'allocatedMinutes', 'actualMinutes', 'status'])) };
}
function cleanTemplates(value) {
  return Object.fromEntries(Object.entries(value).map(([name, tasks]) => [name, tasks.map(task => fields(task, ['name', 'minutes']))]));
}
export function exportLegacyBudget(storage) {
  const templates = read(storage, 'timeBudget_templates', {});
  const current = read(storage, 'timeBudget_currentState', null);
  const session = current === null ? null : { ...current, id: `legacy-budget:${current.startTime}` };
  if (!validBudget({ templates, session })) throw new Error('Invalid original Time Budget records. Nothing was changed.');
  return JSON.stringify({ app: 'time-budget', schemaVersion: 1, templates: cleanTemplates(templates), session: cleanSession(session) }, null, 2);
}
