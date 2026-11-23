import { bindWingspanInputs } from '../../scoring/wingspan/bindings.js';
import { updateWingspanScore } from '../../backend/features/sessions.js';
import { getState } from './state.js';
import { gameUI } from './context.js';
import { guard } from './events.js';
import { applyResult } from './applyResult.js';
import { clearToastTimer } from './clearToastTimer.js';
import { currentLanguage } from './copy.js';

export function bindWingspan(session) {
  bindWingspanInputs(gameUI.app, {
    guard, language: currentLanguage(), preview: (input, setCategory) => {
      const current = getState().sessions.find(item => item.id === session.id);
      return { ...current, scorecard: setCategory(current.scorecard, input.dataset, input.value === '' ? null : Number(input.value)) };
    }, commit: input => {
      const result = updateWingspanScore(getState(), { sessionId: session.id, playerId: input.dataset.playerId, category: input.dataset.category }, input.validity.badInput ? NaN : input.value);
      if (result.errors.length) { applyResult(result); return null; }
      clearToastTimer();
      gameUI.ui.toast = null;
      gameUI.host.querySelectorAll('[data-testid="app-toast"], [data-game-save-error]').forEach(node => node.remove());
      const next = result.data.sessions.find(item => item.id === session.id);
      const form = input.closest('form');
      if (form) { form.dataset.expectedSession = JSON.stringify(next); form.dataset.unsaved = 'false'; }
      return next;
    }
  });
}
