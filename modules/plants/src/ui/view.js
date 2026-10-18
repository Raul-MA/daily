import { captureDrafts, restoreDrafts } from '../../../../packages/ui/src/drafts.js';
import { openCareForm } from './care-form.js';
import { getPlant } from '../store/store.js';
import { plantText } from './copy.js';
import { el, announce } from './elements.js';
import { plantList } from './list.js';
import { plantForm } from './form.js';
import { plantDetail } from './detail.js';
import { plantSettings } from './settings.js';

function pageTitle(context) {
  if (context.route.page === 'plant') return getPlant(context.route.id)?.name || context.copy.missing;
  if (context.route.page === 'plantNew') return context.copy.add;
  if (context.route.page === 'plantEdit') return context.copy.edit;
  if (context.route.page === 'plantSettings') return context.copy.settings;
  return context.copy.title;
}

function pageBody(context) {
  if (context.route.page === 'plant') return plantDetail(context);
  if (context.route.page === 'plantNew' || context.route.page === 'plantEdit') return plantForm(context);
  if (context.route.page === 'plantSettings') return plantSettings(context);
  return plantList(context);
}

function render(context) {
  const drafts = captureDrafts(context.host);
  context.host.replaceChildren();
  try {
    const title = el('h1', 'plant-page-title', pageTitle(context));
    title.tabIndex = -1;
    context.host.append(title, pageBody(context));
    if (context.route.page === 'plant' && context.ui.care) openCareForm(context, context.ui.care.type, context.ui.care.action);
    restoreDrafts(context.host, drafts);
  } catch {
    context.host.append(el('h1', 'plant-page-title', context.copy.title));
    announce(context, context.copy.readError, true);
  }
}

export function mountPlants(options) {
  const host = el('section', 'plants-module');
  host.dataset.module = 'plants';
  const context = { ...options, host, copy: plantText(options.language), render: () => render(context) };
  render(context);
  const visible = () => {
    if (document.visibilityState === 'visible' && context.route.page === 'plants') render(context);
  };
  document.addEventListener('visibilitychange', visible);
  return { node: host, conflict: () => announce(context, context.copy.changed, true), dispose: () => document.removeEventListener('visibilitychange', visible) };
}
