import { coffee } from './frontend/app/context.js';
import { render, renderTabs } from './frontend/app/navigation.js';
import { applyLanguage, applyTheme, showToast } from './frontend/app/notifications.js';
import { handleTasteHelpKeydown } from './frontend/app/taste.js';
import { updateCompositionFields, updateRatioPreview } from './frontend/app/composition.js';

const routes = { coffee: 'new', coffeeNew: 'new', coffeeHistory: 'history', coffeeInsights: 'insights', coffeeSettings: 'settings', coffeeEntry: 'detail', coffeeEntryEdit: 'edit' };

function markDirty(event) {
  const form = event.target.closest('form');
  if (!form || form.id === 'filters') return;
  form.dataset.unsaved = 'true';
  document.dispatchEvent(new Event('daily:form-state'));
}
export function mountCoffee(options) {
  const host = document.createElement('section');
  host.dataset.module = 'coffee';
  host.innerHTML = '<div class="app-shell" id="coffee-content"></div><nav class="bottom-tabs" id="coffee-tabs"></nav><div class="toast" id="coffee-toast" role="status" hidden data-testid="toast"></div>';
  Object.assign(coffee, { ...options, host, app: host.querySelector('#coffee-content'), tabs: host.querySelector('#coffee-tabs'), toast: host.querySelector('#coffee-toast'), route: { name: routes[options.route.page], id: options.route.id }, editingBeanId: options.ui.editingBeanId ?? null });
  applyTheme();
  applyLanguage();
  renderTabs();
  render();
  if (coffee.message) showToast(coffee.message);
  host.addEventListener('input', markDirty);
  host.addEventListener('change', markDirty);
  host.querySelector('h1')?.setAttribute('tabindex', '-1');
  if (coffee.focusExport) {
    delete coffee.focusExport;
    queueMicrotask(() => host.querySelector('#export-data')?.focus());
  }
  return { node: host, dispose, restore: restored, conflict: conflict };
}
function dispose() {
  document.removeEventListener('keydown', handleTasteHelpKeydown);
  coffee.ui.editingBeanId = coffee.editingBeanId;
  clearTimeout(coffee.timer);
}
function conflict() {
  showToast(coffee.host.lang === 'es' ? 'Los datos han cambiado. Conserva tu borrador y vuelve a abrir la vista.' : 'Data changed. Keep your draft and reopen this view.');
}
function restored() {
  if (!coffee.host.querySelector('#entry-form')) return;
  updateCompositionFields();
  updateRatioPreview();
  const score = coffee.host.querySelector('[data-score-value]').value;
  coffee.host.querySelector('.slider-pair output').textContent = score || (coffee.host.lang === 'es' ? 'Omitir' : 'Skip');
}
