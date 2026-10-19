import { href } from '../../../../../packages/platform/src/router.js';
import { coffee } from './context.js';
import { getSettings } from '../../backend/features/settings.js';
import { renderToolsSetup } from './tools.js';
import { renderEntryForm } from './form.js';
import { getEntry } from '../../backend/features/entries.js';
import { renderHistory } from './history.js';
import { renderEntryDetail } from './detail.js';
import { renderInsights } from './insights.js';
import { renderSettings } from './settings.js';

export function setRoute(name, id = null) {
 if (coffee.route.name === name && (coffee.route.id ?? null) === id) {
   render();
   return;
 }
 const pages = { new: 'coffeeNew', history: 'coffeeHistory', detail: 'coffeeEntry', edit: 'coffeeEntryEdit', insights: 'coffeeInsights', settings: 'coffeeSettings' };
 location.hash = href({ page: pages[name], id }, coffee.base).split('#')[1];
 window.scrollTo({ top: 0, behavior: 'smooth' });
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
