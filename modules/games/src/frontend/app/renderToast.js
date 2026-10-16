import { getState } from './state.js';
import { getBackupReminderMessage } from './getBackupReminderMessage.js';
import { copy, message } from './copy.js';
import { gameUI } from './context.js';
import { testIds } from './testIds.js';
import { escapeHtml } from '../components/components.js';

export function renderToast() {
  if (!gameUI.ui.toast?.message) return "";
  const title = ({ error: copy("Needs attention"), backup: copy("Backup reminder") })[gameUI.ui.toast.type] || copy("Done");
  const label = gameUI.ui.toast.type === "backup" ? copy("Open backup export settings") : copy("Dismiss notification");
  return `
    <div class="toast-stack" aria-live="${gameUI.ui.toast.type === "error" ? "assertive" : "polite"}">
      <button class="toast ${gameUI.ui.toast.type}" type="button" data-testid="${testIds.appToast}" data-action="dismiss-toast" aria-label="${label}">
        <strong>${title}</strong>
        <span>${escapeHtml(toastMessage())}</span>
      </button>
    </div>
  `;
}

function toastMessage() {
  const data = getState();
  if (gameUI.ui.toast.type === 'backup') return getBackupReminderMessage(data.settings, data.settings.language);
  return message(gameUI.ui.toast.message);
}
