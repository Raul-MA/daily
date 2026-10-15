import { activitySummary } from './activity-summary.ts';
import type { ShellContext } from './context.ts';
import type { ShellText } from '../../../../packages/i18n/src/shell.ts';
import type { Preferences } from '../../../../packages/data/src/daily-document.ts';
import { shellText } from '../../../../packages/i18n/src/shell.ts';
import { element, link, heading } from './elements.ts';
import { navigation } from './navigation.ts';
import { dashboard } from './dashboard.ts';
import { settings } from './settings.ts';
import { modulePlaceholder } from './module-placeholder.ts';
function focusKey() {
  return document.activeElement instanceof HTMLElement ? document.activeElement.dataset.focus : undefined;
}

function focusAfterRender(root: HTMLElement, key: string | undefined, changedRoute: boolean) {
  if (changedRoute) root.querySelector('h1')?.focus();
  else if (key) root.querySelector<HTMLElement>(`[data-focus="${CSS.escape(key)}"]`)?.focus();
}

function failure(root: HTMLElement, base: string) {
  const copy = shellText(navigator.language.startsWith('es') ? 'es' : 'en');
  const view = element('main', 'storage-failure');
  view.append(heading(copy.storageTitle), element('p', '', copy.storageError), link(copy.diagnostic, `${base}diagnostics.html`));
  root.replaceChildren(view);
}

function pageView(context: ShellContext, preferences: Preferences) {
  if (context.route.page === 'home') return dashboard(preferences, context.base, context.state);
  if (context.route.page === 'settings') return settings(preferences);
  return modulePlaceholder(context.route, shellText(preferences.language), context.base);
}

export function renderShell(context: ShellContext, changedRoute = false) {
    const key = focusKey();
    try {
      const snapshot = context.state.read();
      const preferences = snapshot.value.preferences;
      const copy = shellText(preferences.language);
      document.documentElement.lang = preferences.language;
      const main = element('main', 'shell-main');
      main.id = 'content';
      main.tabIndex = -1;
      appendAlert(main, context, snapshot.status === 'recovered');
      main.append(pageView(context, preferences));
      document.title = `${main.querySelector('h1')?.textContent ?? 'Daily'} · Daily`;
      main.append(saveStatus(context, copy));
      const skip = link(copy.skip, '#content', 'skip-link');
      skip.dataset.skip = '';
      context.root.replaceChildren(skip, navigation(preferences.language, context.base), activitySummary({ state: context.state, language: preferences.language, base: context.base }, true), main, element('footer', 'shell-footer', copy.local));
      focusAfterRender(context.root, key, changedRoute);
    } catch {
      failure(context.root, context.base);
    }
}

function appendAlert(main: HTMLElement, context: ShellContext, recovered: boolean) {
  if (!context.error && !recovered) return;
  const copy = shellText(context.state.read().value.preferences.language);
  const alert = element('p', 'save-alert', context.error ? copy.saveError : copy.recovered);
  alert.setAttribute('role', 'alert');
  main.append(alert);
}

function saveStatus(context: ShellContext, copy: ShellText) {
  const status = element('p', 'save-status', context.saved && !context.error ? copy.saved : '');
  status.setAttribute('role', 'status');
  return status;
}
