import { renderShell } from './render.js';
import { activitySummary } from './activity-summary.js';
import { shellText } from '../../../../packages/i18n/src/shell.js';

export function committed(context) {
  context.saved = true;
  context.error = false;
  const preferences = context.state.read().value.preferences;
  const samePreferences = JSON.stringify(preferences) === context.preferencesKey;
  const modulePage = context.route.page.startsWith('plant') || context.route.page.startsWith('coffee');
  if (!modulePage || !samePreferences) {
    renderShell(context);
    return;
  }
  const status = context.root.querySelector('.save-status');
  if (status) status.textContent = shellText(preferences.language).saved;
  const indicator = context.root.querySelector('.running-indicator');
  indicator?.replaceWith(activitySummary({ state: context.state, language: preferences.language, base: context.base }, true));
}
