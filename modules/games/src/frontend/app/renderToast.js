import { gameUI } from './context.js';
import { testIds } from './testIds.js';
import { escapeHtml } from '../components/components.js';

export function renderToast() {
  if (!gameUI.ui.toast?.message) return "";
  const title = ({ error: 'Needs attention', backup: 'Backup reminder' })[gameUI.ui.toast.type] || 'Done';
  const label = gameUI.ui.toast.type === "backup" ? "Open backup export settings" : "Dismiss notification";
  return `
    <div class="toast-stack" aria-live="${gameUI.ui.toast.type === "error" ? "assertive" : "polite"}">
      <button class="toast ${gameUI.ui.toast.type}" type="button" data-testid="${testIds.appToast}" data-action="dismiss-toast" aria-label="${label}">
        <strong>${title}</strong>
        <span>${escapeHtml(gameUI.ui.toast.message)}</span>
      </button>
    </div>
  `;
}
