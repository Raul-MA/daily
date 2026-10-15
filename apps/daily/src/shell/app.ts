import { mountPwa } from './pwa.ts';
import { refreshActivityTimes } from './activity-summary.ts';
import { createDailyState, DAILY_KEY } from '../../../../packages/data/src/daily-state.ts';
import { startRouter, parseHash } from '../../../../packages/platform/src/router.ts';
import type { ShellContext } from './context.ts';
import { renderShell } from './render.ts';
import { handleClick, handleChange } from './interactions.ts';

export function mountShell(root: HTMLElement, base: string) {
  const state = createDailyState(localStorage, navigator.language.startsWith('es') ? 'es' : 'en');
  const context: ShellContext = { root, base, state, route: parseHash(location.hash), error: false, saved: false };
  const stopPwa = import.meta.env.PROD ? mountPwa(state, base) : () => undefined;
  const stopState = state.subscribe(() => { context.saved = true; context.error = false; renderShell(context); });
  const perform = (event: Event) => {
    if (event.target instanceof Element && event.target.closest('[data-skip]')) {
      event.preventDefault();
      root.querySelector<HTMLElement>('#content')?.focus();
      return;
    }
    try {
      if (event.type === 'click') handleClick(event, state);
      else handleChange(event, state);
    } catch {
      context.error = true;
      renderShell(context);
    }
  };
  root.addEventListener('click', perform);
  root.addEventListener('change', perform);
  const stopRouter = startRouter(window, next => { context.route = next; renderShell(context, true); });
  const storageChanged = (event: StorageEvent) => { if (event.key === DAILY_KEY) renderShell(context); };
  window.addEventListener('storage', storageChanged);
  const ticker = window.setInterval(() => refreshActivityTimes(root, state), 1000);
  const visible = () => refreshActivityTimes(root, state);
  document.addEventListener('visibilitychange', visible);
  return () => {
    window.clearInterval(ticker);
    document.removeEventListener('visibilitychange', visible);
    stopPwa();
    stopState();
    stopRouter();
    root.removeEventListener('click', perform);
    root.removeEventListener('change', perform);
    window.removeEventListener('storage', storageChanged);
  };
}
