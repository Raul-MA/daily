import { DAILY_KEY } from '../../../../packages/data/src/daily-state.js';
import { DataConflictError } from '../../../../packages/data/src/errors.js';
import { parseDailyBackup } from './service.js';
import { assertRestoreDocument, backupCounts } from './schema.js';

const keys = [DAILY_KEY, `${DAILY_KEY}:recovery`, `${DAILY_KEY}:corrupt`];
function snapshot(storage) { return Object.fromEntries(keys.map(key => [key, storage.getItem(key)])); }
function assertStoredVersion(entries) {
  let current;
  try { current = JSON.parse(entries[DAILY_KEY]); }
  catch { return; }
  if (typeof current?.version === 'number' && current.version > 1) throw new Error('Unsupported future stored document version.');
}
export function connectRecoveryBackups(storage, options = {}) {
  const previews = new WeakMap();
  function previewImport(text) {
    const data = parseDailyBackup(text);
    const entries = snapshot(storage);
    assertStoredVersion(entries);
    const preview = { data, counts: backupCounts(data) };
    previews.set(preview, { entries: JSON.stringify(entries), preview: JSON.stringify(preview), data: JSON.stringify(data) });
    return preview;
  }
  function applyImport(preview) {
    const expected = previews.get(preview);
    if (!expected) throw new Error('Unknown or used Daily recovery preview.');
    if (expected.preview !== JSON.stringify(preview)) throw new Error('Changed Daily recovery preview.');
    if (expected.entries !== JSON.stringify(snapshot(storage))) throw new DataConflictError();
    const data = JSON.parse(expected.data);
    assertRestoreDocument(data);
    storage.setItem(DAILY_KEY, expected.data);
    previews.delete(preview);
    try { options.afterRestore?.(); }
    catch (error) { error.rootApplied = true; throw error; }
  }
  function exportRecovery() {
    return JSON.stringify({ app: 'daily-storage-recovery', schemaVersion: 1, entries: snapshot(storage) }, null, 2);
  }
  return { previewImport, applyImport, exportRecovery };
}
