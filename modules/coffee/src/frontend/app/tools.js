import { completeToolSetup } from '../../backend/features/setup.js';
import { getSettings } from '../../backend/features/settings.js';
import { coffee } from './context.js';
import { pageHeader } from './format.js';
import { tr } from './copy.js';
import { section, escapeHtml, fieldRow, toggle } from '../components/components.js';
import { testIds } from './testIds.js';
import { render } from './navigation.js';
import { showToastKey, attempt } from './notifications.js';
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
    const tools = readToolSettings(new FormData(event.currentTarget));
    attempt(() => finishSetup(tools));
  });
  coffee.host.querySelector("#skip-tools-setup").addEventListener("click", () => {
    attempt(() => finishSetup(emptyTools()));
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

function finishSetup(tools) {
  completeToolSetup(tools);
  showToastKey("toastToolsSaved");
  render();
}
