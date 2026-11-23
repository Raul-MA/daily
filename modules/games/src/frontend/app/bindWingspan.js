import { bindWingspanInputs, readWingspanEntries, normalizeWingspanInputs } from '../../scoring/wingspan/bindings.js';
import { updateWingspanScores } from '../../backend/features/sessions.js';
import { getState } from './state.js';
import { gameUI } from './context.js';
import { guard } from './events.js';
import { applyResult } from './applyResult.js';
import { clearToastTimer } from './clearToastTimer.js';
import { currentLanguage } from './copy.js';

export function bindWingspan(session) {
  const commit = () => commitWingspan(session.id);
  bindWingspanInputs(gameUI.app, { guard, language: currentLanguage(), commit });
  return commit;
}

function commitWingspan(sessionId) {
  const entries = readWingspanEntries(gameUI.app);
  const result = updateWingspanScores(getState(), sessionId, entries);
  if (result.errors.length) { applyResult(result); return false; }
  normalizeWingspanInputs(gameUI.app);
  clearToastTimer();
  gameUI.ui.toast = null;
  gameUI.host.querySelectorAll('[data-testid="app-toast"], [data-game-save-error]').forEach(node => node.remove());
  const next = result.data.sessions.find(item => item.id === sessionId);
  const form = gameUI.app.querySelector('#games-session');
  if (form) { form.dataset.expectedSession = JSON.stringify(next); form.dataset.unsaved = 'false'; }
  return true;
}
