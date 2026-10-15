import { gameUI } from './context.js';
import { checkDraft } from './drafts.js';
import { clearToastTimer } from './clearToastTimer.js';

export function guard(callback) {
  return event => {
    try { checkDraft(event); return callback(event); }
    catch (error) {
      event.preventDefault();
      clearToastTimer();
      gameUI.ui.toast = null;
      gameUI.host.querySelectorAll('[data-testid=app-toast]').forEach(node => node.remove());
      gameUI.host.querySelector('[data-game-save-error]')?.remove();
      const alert = document.createElement('p');
      alert.dataset.gameSaveError = '';
      alert.dataset.testid = 'app-toast';
      alert.setAttribute('role', 'alert');
      alert.textContent = error.message;
      gameUI.host.append(alert);
    } finally { document.dispatchEvent(new Event('daily:form-state')); }
  };
}
export function listen(selector, event, handler) {
  gameUI.app.querySelector(selector)?.addEventListener(event, guard(handler));
}
