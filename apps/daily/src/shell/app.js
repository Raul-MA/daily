import { refreshReadingWidgets } from './reading-widgets.js';
import { watchCalendar } from '../../../../packages/platform/src/calendar.js';
import { connectModules, stopModules } from './modules.js';
import { committed } from './committed.js';
import { mountPwa } from './pwa.js';
import { refreshActivityTimes } from './activity-summary.js';
import { createDailyState, DAILY_KEY } from '../../../../packages/data/src/daily-state.js';
import { startRouter, parseHash } from '../../../../packages/platform/src/router.js';
import { renderShell } from './render.js';
import { handleClick, handleChange } from './interactions.js';
export function mountShell(root, base) {
    const state = createDailyState(localStorage, navigator.language.startsWith('es') ? 'es' : 'en');
    const context = { root, base, state, moduleUI: {}, route: parseHash(location.hash), error: false, saved: false };
    Object.assign(context, connectModules(state));
    const stopPwa = mountPwa(state, base);
    const stopCalendar = watchCalendar(window, () => calendarRefresh(context));
    const stopReading = context.reading.subscribe(() => refreshReadingWidgets(context));
    const stopState = state.subscribe(() => committed(context));
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
    const stopRouter = startRouter(window, next => {
        context.moduleUI = {};
        context.route = next;
        renderShell(context, true);
    });
    const storageChanged = event => storageRefresh(event, context);
    window.addEventListener('storage', storageChanged);
    const ticker = window.setInterval(() => refreshActivityTimes(root, state), 1000);
    const visible = () => { refreshActivityTimes(root, state); refreshReadingWidgets(context); };
    document.addEventListener('visibilitychange', visible);
    return () => {
        window.clearInterval(ticker);
        document.removeEventListener('visibilitychange', visible);
        context.pageCleanup?.();
        stopModules(context);
        stopCalendar();
        stopPwa();
        stopState();
        stopReading();
        stopRouter();
        root.removeEventListener('click', perform);
        root.removeEventListener('change', perform);
        window.removeEventListener('storage', storageChanged);
    };
}

function storageRefresh(event, context) {
    if (event.key !== DAILY_KEY && event.key !== null) return;
    if (context.pageConflict && context.root.querySelector('form[data-unsaved="true"]')) {
        context.pageConflict();
        return;
    }
    renderShell(context);
}

function calendarRefresh(context) {
    if (context.route.page === 'home' || context.route.page === 'plants') renderShell(context);
}
