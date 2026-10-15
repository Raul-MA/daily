import { captureDrafts, restoreDrafts } from '../../../../packages/ui/src/drafts.js';
import { mountPlants } from '../../../../modules/plants/src/ui/view.js';
import { mountCoffee } from '../../../../modules/coffee/src/view.js';
import { activitySummary } from './activity-summary.js';
import { shellText } from '../../../../packages/i18n/src/shell.js';
import { element, link, heading } from './elements.js';
import { navigation } from './navigation.js';
import { dashboard } from './dashboard.js';
import { settings } from './settings.js';
import { modulePlaceholder } from './module-placeholder.js';
function focusKey() {
    return document.activeElement instanceof HTMLElement ? document.activeElement.dataset.focus : undefined;
}
function focusAfterRender(root, key, changedRoute) {
    if (changedRoute)
        root.querySelector('h1')?.focus();
    else if (key)
        root.querySelector(`[data-focus="${CSS.escape(key)}"]`)?.focus();
}
function failure(root, base) {
    const copy = shellText(navigator.language.startsWith('es') ? 'es' : 'en');
    const view = element('main', 'storage-failure');
    view.append(heading(copy.storageTitle), element('p', '', copy.storageError), link(copy.diagnostic, `${base}diagnostics.html`));
    root.replaceChildren(view);
}
function pageView(context, preferences) {
    if (context.route.page.startsWith('coffee')) {
        const page = mountCoffee({ route: context.route, base: context.base, service: context.coffee, ui: context.moduleUI });
        context.pageCleanup = page.dispose;
        context.pageConflict = page.conflict;
        context.pageRestore = page.restore;
        return page.node;
    }
    if (['plants', 'plant', 'plantNew', 'plantEdit', 'plantSettings'].includes(context.route.page)) {
        const page = mountPlants({ route: context.route, language: preferences.language, base: context.base, service: context.plants, ui: context.moduleUI });
        context.pageCleanup = page.dispose;
        context.pageConflict = page.conflict;
        return page.node;
    }
    if (context.route.page === 'home')
        return dashboard(preferences, context.base, { state: context.state, plants: context.plants });
    if (context.route.page === 'settings')
        return settings(preferences);
    return modulePlaceholder(context.route, shellText(preferences.language), context.base);
}
export function renderShell(context, changedRoute = false) {
    const key = focusKey();
    const drafts = changedRoute ? [] : captureDrafts(context.root);
    try {
        const snapshot = context.state.read();
        const preferences = snapshot.value.preferences;
        context.preferencesKey = JSON.stringify(preferences);
        context.pageCleanup?.();
        context.pageCleanup = undefined;
        context.pageConflict = undefined;
        context.pageRestore = undefined;
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
        restoreDrafts(context.root, drafts);
        context.pageRestore?.();
        document.dispatchEvent(new Event('daily:form-state'));
    }
    catch {
        failure(context.root, context.base);
    }
}
function appendAlert(main, context, recovered) {
    if (!context.error && !recovered)
        return;
    const copy = shellText(context.state.read().value.preferences.language);
    const alert = element('p', 'save-alert', context.error ? copy.saveError : copy.recovered);
    alert.setAttribute('role', 'alert');
    main.append(alert);
}
function saveStatus(context, copy) {
    const status = element('p', 'save-status', context.saved && !context.error ? copy.saved : '');
    status.setAttribute('role', 'status');
    return status;
}
