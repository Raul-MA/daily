import { getSettings, updateSettings } from '../../backend/features/settings.js';
import { coffee } from './context.js';
import { pageHeader } from './format.js';
import { tr } from './copy.js';
import { section, escapeHtml, fieldRow, toggle } from '../components/components.js';
import { testIds } from './testIds.js';
import { seedIfEmpty, render } from './navigation.js';
import { showToastKey } from './notifications.js';
import { prepTools } from './constants.js';

export function renderToolsSetup() {
  const settings = getSettings();
  coffee.app.innerHTML = `
    ${pageHeader(tr("pageToolsTitle"), tr("pageToolsSubtitle"))}
    ${section(tr("sectionToolSetup"), `
      <form id="tools-setup-form" class="specimen-form compact" data-testid="${testIds.toolsSetupForm}">
        ${toolRows(settings.tools)}
        <div class="action-row">
          <button class="secondary" type="button" id="skip-tools-setup" data-testid="${testIds.skipToolsSetup}">${escapeHtml(tr("buttonSkip"))}</button>
          <button class="primary" type="submit" data-testid="${testIds.saveToolsSetup}">${escapeHtml(tr("buttonSaveTools"))}</button>
        </div>
      </form>
    `, tr("sectionPrep"))}
  `;

  coffee.host.querySelector("#tools-setup-form").addEventListener("submit", (event) => {
    event.preventDefault();
    saveToolSettings(new FormData(event.currentTarget));
    seedIfEmpty();
    showToastKey("toastToolsSaved");
    render();
  });
  coffee.host.querySelector("#skip-tools-setup").addEventListener("click", () => {
    updateSettings({ toolsConfigured: true, tools: emptyTools() });
    seedIfEmpty();
    showToastKey("toastToolsSaved");
    render();
  });
}

export function toolRows(tools) {
  return prepTools.map((tool) => fieldRow({
    id: `tool-${tool.key}`,
    label: tool.label || tr(tool.labelKey),
    control: toggle({ id: `tool-${tool.key}`, checked: Boolean(tools?.[tool.key]) })
  })).join("");
}

export function emptyTools() {
  return Object.fromEntries(prepTools.map((tool) => [tool.key, false]));
}

export function readToolSettings(data) {
  return Object.fromEntries(prepTools.map((tool) => [tool.key, data.get(`tool-${tool.key}`) === "on"]));
}

export function saveToolSettings(data) {
  updateSettings({ toolsConfigured: true, tools: readToolSettings(data) });
}
