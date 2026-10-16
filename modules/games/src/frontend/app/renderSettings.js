import { copy } from './copy.js';
import { isExportStale } from '../../backend/features/settings.js';
import { testIds } from './testIds.js';
import { escapeHtml, option } from '../components/components.js';
import { getBackupReminderMessage } from './getBackupReminderMessage.js';
import { t, getAvailableLanguages } from '../../backend/core/i18n.js';

export function renderSettings(data) {
  const language = data.settings.language;
  return `
    <section class="view-header">
      <p>${copy("Settings")}</p>
      <h1>${copy("Local data")}</h1>
    </section>
    <section class="ledger-block settings">
      ${isExportStale(data.settings) ? `<p data-testid="${testIds.backupReminder}" class="notice">${escapeHtml(getBackupReminderMessage(data.settings, language))}</p>` : ""}
      <label>
        ${escapeHtml(t(language, "theme"))}
        <select data-testid="${testIds.settingsTheme}">
          ${option("system", t(language, "system"), data.settings.theme)}
          ${option("light", t(language, "light"), data.settings.theme)}
          ${option("dark", t(language, "dark"), data.settings.theme)}
        </select>
      </label>
      <label>
        ${escapeHtml(t(language, "language"))}
        <select data-testid="${testIds.settingsLanguage}">
          ${getAvailableLanguages().map((code) => option(code, code.toUpperCase(), data.settings.language)).join("")}
        </select>
      </label>
      <label>
        ${copy("Backup reminder days")}
        <input data-testid="${testIds.settingsReminderDays}" type="number" min="1" step="1" value="${escapeHtml(data.settings.backupReminderDays)}">
      </label>
      <label class="check-row">
        <input data-setting="confirmBeforeFinishingSession" type="checkbox" ${data.settings.confirmBeforeFinishingSession ? "checked" : ""}>
        <span class="setting-label">${copy("Confirm before finishing a session")}</span>
      </label>
      <label class="check-row">
        <input data-setting="showArchived" type="checkbox" ${data.settings.showArchived ? "checked" : ""}>
        <span class="setting-label">${copy("Show archived games and players")}</span>
      </label>
      <div class="actions">
        <button data-testid="${testIds.exportButton}" type="button">${escapeHtml(t(language, "exportData"))}</button>
        <label class="file-button">
          ${escapeHtml(t(language, "importData"))}
          <input data-testid="${testIds.importInput}" type="file" accept="application/json">
        </label>
      </div>
    </section>
  `;
}
