import { section, escapeHtml, icons, selectInput } from '../components/components.js';
import { tr } from './copy.js';
import { testIds } from './testIds.js';

export function settingsBackup(exportReminder) {
  return section(tr("sectionData"), `
      ${exportReminder ? `<p class="backup-reminder" data-testid="${testIds.exportReminder}">${escapeHtml(exportReminder)}</p>` : ""}
      <div class="action-row">
        <button class="secondary" type="button" id="export-data" data-testid="${testIds.exportData}">${icons.download} ${escapeHtml(tr("buttonExportJson"))}</button>
        <label class="file-button">${icons.upload} ${escapeHtml(tr("buttonImportJson"))}<input id="import-data" type="file" accept="application/json" data-testid="${testIds.importData}"></label>
      </div>
      <div class="import-mode">
        ${selectInput({ id: "importMode", value: "merge", options: [
          { value: "merge", label: tr("optionMergeImport") },
          { value: "replace", label: tr("optionReplaceImport") }
        ] })}
      </div>
    `, tr("captionBackup"));
}
