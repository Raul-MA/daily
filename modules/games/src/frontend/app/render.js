import { getState } from './state.js';
import { applyTheme } from './applyTheme.js';
import { syncBackupToast } from './syncBackupToast.js';
import { getRoute } from './router.js';
import { gameUI } from './context.js';
import { renderRoute } from './renderRoute.js';
import { renderToast } from './renderToast.js';
import { bindEvents } from './bindEvents.js';
import { focusPendingTarget } from './focusPendingTarget.js';
import { captureDrafts, restoreDrafts } from '../../../../../packages/ui/src/drafts.js';
import { prepareForms, restored } from './drafts.js';

export function render() {
  const drafts = captureDrafts(gameUI.host);
  const data = getState();
  applyTheme(data.settings.theme);
  syncBackupToast(data);
  const route = getRoute();

  gameUI.app.innerHTML = `
    <div class="app-shell">
      <div class="workspace">
        ${renderRoute(route, data)}
      </div>
      ${renderToast()}
    </div>
  `;
  prepareForms();
  bindEvents();
  restoreDrafts(gameUI.host, drafts);
  restored();
  focusPendingTarget(route);
  document.dispatchEvent(new Event('daily:form-state'));
}
