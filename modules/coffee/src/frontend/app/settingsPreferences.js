import { section, fieldRow, selectInput, textInput, escapeHtml } from '../components/components.js';
import { tr } from './copy.js';
import { testIds } from './testIds.js';
import { getAvailableLanguages } from '../../backend/core/i18n.js';
import { toolRows } from './tools.js';

export function settingsPreferences(settings) {
  return section(tr("sectionPreferences"), `
      <form id="settings-form" class="specimen-form compact" data-testid="${testIds.settingsForm}">
        ${fieldRow({ id: "theme", label: tr("labelTheme"), control: selectInput({ id: "theme", value: settings.theme, options: [
          { value: "system", label: tr("optionSystem") },
          { value: "light", label: tr("optionLight") },
          { value: "dark", label: tr("optionDark") }
        ] }) })}
        ${fieldRow({ id: "language", label: tr("labelLanguage"), control: selectInput({ id: "language", value: settings.language, options: getAvailableLanguages().map((code) => ({
          value: code,
          label: code === "es" ? tr("optionSpanish") : tr("optionEnglish")
        })) }), attrs: `data-testid="${testIds.settingsLanguage}"` })}
        ${fieldRow({ id: "burrTouchReference", label: tr("labelBurrTouch"), control: textInput({ id: "burrTouchReference", value: settings.burrTouchReference, placeholder: tr("placeholderBurrTouch") }) })}
        ${toolRows(settings.tools)}
        <div class="action-row"><button class="primary" type="submit" data-testid="${testIds.saveSettings}">${escapeHtml(tr("buttonSaveSettings"))}</button></div>
      </form>
    `, tr("captionDevice"));
}
