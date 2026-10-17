import { DataConflictError } from '../../../../packages/data/src/errors.js';
import { assertRestoreDocument, backupCounts } from './schema.js';

export function parseDailyBackup(text) {
  const input = JSON.parse(text);
  if (input?.app !== undefined) {
    if (input.app !== 'daily-pwa') throw new Error('Unsupported Daily backup format. Choose an app import for a legacy backup.');
    if (input.schemaVersion !== 1) throw new Error('Unsupported Daily backup schema version.');
    assertRestoreDocument(input.data);
    return input.data;
  }
  assertRestoreDocument(input);
  return input;
}
export function connectDailyBackups(state, options = {}) {
  const previews = new WeakMap();
  function previewImport(text) {
    const data = parseDailyBackup(text);
    const preview = { data, counts: backupCounts(data) };
    previews.set(preview, { root: JSON.stringify(state.read().value), preview: JSON.stringify(preview), data: JSON.stringify(data) });
    return preview;
  }
  function applyImport(preview) {
    const expected = previews.get(preview);
    if (!expected) throw new Error('Unknown or used Daily import preview.');
    if (expected.preview !== JSON.stringify(preview)) throw new Error('Changed Daily import preview.');
    const data = JSON.parse(expected.data);
    assertRestoreDocument(data);
    state.commit(current => {
      if (JSON.stringify(current) !== expected.root) throw new DataConflictError();
      return data;
    });
    previews.delete(preview);
    try { options.afterRestore?.(); }
    catch (error) { error.rootApplied = true; throw error; }
  }
  function exportBackup() {
    const data = state.read().value;
    assertRestoreDocument(data);
    return JSON.stringify({ app: 'daily-pwa', schemaVersion: 1, data }, null, 2);
  }
  return { previewImport, applyImport, exportBackup, exportRecovery: () => JSON.stringify(state.read().value, null, 2) };
}
