import { getBeanPresets, createBeanPreset } from '../../backend/features/beans.js';
import { href } from '../../../../../packages/platform/src/router.js';
import { coffee } from './context.js';
import { currentLanguage } from './copy.js';
import { t } from '../../backend/core/i18n.js';
import { testIds } from './testIds.js';
import { capitalize } from './format.js';
import { escapeHtml } from '../components/components.js';
import { getSettings } from '../../backend/features/settings.js';
import { renderToolsSetup } from './tools.js';
import { renderEntryForm } from './form.js';
import { getEntry } from '../../backend/features/entries.js';
import { renderHistory } from './history.js';
import { renderEntryDetail } from './detail.js';
import { renderInsights } from './insights.js';
import { renderSettings } from './settings.js';

export function seedIfEmpty() {
  if (getBeanPresets().length) return;
  createBeanPreset({
    brand: "House",
    blend: "First Dial-In",
    decaf: false,
    roastOrigin: "Starter preset"
  });
}

export function setRoute(name, id = null) {
 if (coffee.route.name === name && (coffee.route.id ?? null) === id) {
   renderTabs();
   render();
   return;
 }
 const pages = { new: 'coffeeNew', history: 'coffeeHistory', detail: 'coffeeEntry', edit: 'coffeeEntryEdit', insights: 'coffeeInsights', settings: 'coffeeSettings' };
 location.hash = href({ page: pages[name], id }, coffee.base).split('#')[1];
 window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function renderTabs() {
  const language = currentLanguage();
  const items = [
    ["new", "navNew"],
    ["history", "navHistory"],
    ["insights", "navInsights"],
    ["settings", "navSettings"]
  ];

  coffee.tabs.setAttribute("aria-label", t(language, "ariaPrimaryNavigation"));
  coffee.tabs.innerHTML = items.map(([name, labelKey]) => `
    <button type="button" class="${coffee.route.name === name ? "active" : ""}" data-route="${name}" data-testid="${testIds[`nav${capitalize(name)}`]}">
      <span>${escapeHtml(t(language, labelKey))}</span>
    </button>
  `).join("");

  coffee.tabs.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => setRoute(button.dataset.route));
  });
}

export function render() {
  if (!getSettings().toolsConfigured) return renderToolsSetup();
  if (coffee.route.name === "edit") return renderEdit(coffee.route.id);
  if (coffee.route.name === "history") return renderHistory();
  if (coffee.route.name === "detail") return renderEntryDetail(coffee.route.id);
  if (coffee.route.name === "insights") return renderInsights();
  if (coffee.route.name === "settings") return renderSettings();
  return renderEntryForm();
}

function renderEdit(id) {
  const entry = getEntry(id);
  if (!entry) return renderEntryDetail(id);
  return renderEntryForm(entry);
}

export function goToExportSettings() { coffee.focusExport = true; setRoute('settings'); }
