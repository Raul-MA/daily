import { selectGameImport } from './import-preview.js';
import { listen, guard } from './events.js';
import { testIds } from './testIds.js';
import { setState, getState } from './state.js';
import { updateSettings } from '../../backend/features/settings.js';
import { render } from './render.js';
import { gameUI } from './context.js';
import { downloadBackup } from '../../backend/features/importExport.js';

export function bindSettings() {
  listen(`[data-testid="${testIds.settingsTheme}"]`, "change", (event) => {
    setState(updateSettings(getState(), { theme: event.target.value }));
    render();
  });
  listen(`[data-testid="${testIds.settingsLanguage}"]`, "change", (event) => {
    setState(updateSettings(getState(), { language: event.target.value }));
    render();
  });
  listen(`[data-testid="${testIds.settingsReminderDays}"]`, "change", (event) => {
    setState(updateSettings(getState(), { backupReminderDays: Number(event.target.value) || 7 }));
    render();
  });
  gameUI.app.querySelectorAll("[data-setting]").forEach((input) => {
    input.addEventListener("change", guard(() => {
      setState(updateSettings(getState(), { [input.dataset.setting]: input.checked }));
      render();
    }));
  });
  listen(`[data-testid="${testIds.exportButton}"]`, "click", () => {
    setState(downloadBackup(getState()));
    render();
  });
  listen(`[data-testid="${testIds.importInput}"]`, "change", selectGameImport);
}
