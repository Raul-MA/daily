import { DataConflictError } from '../../../packages/data/src/errors.js';
import { validBudget, validTemplates } from './validation.js';
import { validateActivities } from '../../../packages/platform/src/activity-types.js';

function parseBackup(text, current) {
  const incoming = JSON.parse(text);
  if (incoming?.app === 'time-budget') {
    if (incoming.schemaVersion !== 1) throw new Error('Unsupported Time Budget schema version.');
    const data = { templates: incoming.templates, session: incoming.session };
    if (!validBudget(data)) throw new Error('Invalid Time Budget migration backup.');
    if (incoming.countdowns !== undefined && !validCountdowns(incoming.countdowns)) throw new Error('Invalid countdown backup.');
    return { data, countdowns: incoming.countdowns };
  }
  if (!validTemplates(incoming)) throw new Error('Invalid Time Budget templates.');
  return { data: { ...current, templates: { ...current.templates, ...incoming } } };
}
function validCountdowns(value) { return validateActivities(value) && value.every(item => item.kind === 'countdown'); }
export function budgetImports(state, service) {
  const previews = new WeakMap();
  function previewImport(text) {
    const { data, countdowns } = parseBackup(text, service.read());
    const preview = { data, countdowns, counts: { templates: Object.keys(data.templates).length, tasks: data.session?.tasks.length ?? 0, countdowns: countdowns?.length ?? 0 } };
    previews.set(preview, { root: JSON.stringify(state.read().value), data: JSON.stringify(preview) });
    return preview;
  }
  function applyImport(preview) {
    const expected = previews.get(preview);
    if (!expected) throw new Error('Unknown Time Budget import preview.');
    if (expected.root !== JSON.stringify(state.read().value)) throw new DataConflictError();
    if (expected.data !== JSON.stringify(preview)) throw new Error('Changed import preview.');
    service.replace(preview.data, preview.countdowns);
    previews.delete(preview);
  }
  function exportMigration() { return JSON.stringify({ app: 'time-budget', schemaVersion: 1, ...service.read(), countdowns: service.countdowns.list() }, null, 2); }
  return { previewImport, applyImport, exportMigration, exportTemplates: () => JSON.stringify(service.read().templates, null, 2), exportRecovery: () => JSON.stringify(state.read().value, null, 2) };
}
