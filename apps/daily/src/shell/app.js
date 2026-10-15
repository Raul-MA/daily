import { mountPwa } from './pwa.js';
import { refreshActivityTimes } from './activity-summary.js';
import { createDailyState, DAILY_KEY } from '../../../../packages/data/src/daily-state.js';
import { startRouter, parseHash } from '../../../../packages/platform/src/router.js';
import { renderShell } from './render.js';
import { handleClick, handleChange } from './interactions.js';
export function mountShell(root, base) {
    const state = createDailyState(localStorage, navigator.language.startsWith('es') ? 'es' : 'en');
    const context = { root, base, state, route: parseHash(location.hash), error: false, saved: false };
    const stopPwa = mountPwa(state, base);
    const stopState = state.subscribe(() => { context.saved = true; context.error = false; renderShell(context); });
    const perform = (event) => {
        if (event.target instanceof Element && event.target.closest('[data-skip]')) {
            event.preventDefault();
            root.querySelector('#content')?.focus();
            return;
        }
        try {
            if (event.type === 'click')
                handleClick(event, state);
            else
                handleChange(event, state);
        }
        catch {
            context.error = true;
            renderShell(context);
        }
    };
    root.addEventListener('click', perform);
    root.addEventListener('change', perform);
    const stopRouter = startRouter(window, next => { context.route = next; renderShell(context, true); });
    const storageChanged = (event) => { if (event.key === DAILY_KEY)
        renderShell(context); };
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
