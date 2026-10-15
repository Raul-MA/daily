import { isExportStale } from '../../backend/features/settings.js';
import { gameUI } from './context.js';
import { showToast } from './showToast.js';
import { getBackupReminderMessage } from './getBackupReminderMessage.js';
import { clearToastTimer } from './clearToastTimer.js';

export function syncBackupToast(data) {
  if (isExportStale(data.settings)) {
    if (!gameUI.ui.backupToastShown && !gameUI.ui.toast) {
      gameUI.ui.backupToastShown = true;
      showToast(getBackupReminderMessage(data.settings, data.settings.language), "backup", 0);
    }
    return;
  }
  if (gameUI.ui.toast?.type === "backup") {
    clearToastTimer();
    gameUI.ui.toast = null;
  }
}
