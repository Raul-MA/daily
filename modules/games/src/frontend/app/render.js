import { copy } from './copy.js';
import { getState } from './state.js';
import { applyTheme } from './applyTheme.js';
import { syncBackupToast } from './syncBackupToast.js';
import { getRoute } from './router.js';
import { getActiveSession } from '../../backend/features/sessions.js';
import { gameUI } from './context.js';
import { escapeHtml } from '../components/components.js';
import { t } from '../../backend/core/i18n.js';
import { renderNav } from './renderNav.js';
import { renderRoute } from './renderRoute.js';
import { renderNavButtons } from './renderNavButtons.js';
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
  const active = getActiveSession(data);

  gameUI.app.innerHTML = `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="brand">
          <span class="brand-mark">#</span>
          <div>
            <strong>${escapeHtml(t(data.settings.language, "appTitle"))}</strong>
            <span>${active ? copy("Session in progress") : copy("Ready to play")}</span>
          </div>
        </div>
        ${renderNav(route, Boolean(active))}
      </aside>
      <div class="workspace">
        ${renderRoute(route, data)}
      </div>
      <nav class="bottom-nav">${renderNavButtons(route, Boolean(active), true)}</nav>
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
