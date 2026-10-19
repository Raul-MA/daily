import { validateBackup } from './backend/core/validation.js';
import { normalizeData } from './backend/core/schema.js';
import { validGames } from './validation.js';
import { DataConflictError } from '../../../packages/data/src/errors.js';

export function gameImports(state, adapter) {
  const previews = new WeakSet();
  function previewImport(text) {
    const incoming = JSON.parse(text);
    const errors = validateBackup(incoming);
    if (errors.length) throw new Error(errors.join(' '));
    const data = normalizeData(incoming);
    data.settings.language = state.read().value.preferences.language;
    if (!validGames(data)) throw new Error('Invalid game backup.');
    const preview = { data, counts: { players: data.players.length, games: data.games.length, sessions: data.sessions.length }, expected: JSON.stringify(state.read().value) };
    previews.add(preview);
    return preview;
  }
  function applyImport(preview) {
    if (!previews.has(preview)) throw new Error('Unknown game import preview.');
    if (preview.expected !== JSON.stringify(state.read().value)) throw new DataConflictError();
    adapter.replace(preview.data);
    previews.delete(preview);
  }
  return { previewImport, applyImport, exportRecovery: () => JSON.stringify(state.read().value, null, 2) };
}
