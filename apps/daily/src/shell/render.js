import { parseHash } from '../../../../packages/platform/src/router.js';
import { connectRecoveryBackups } from '../backup/recovery.js';
import { mountStorageRecovery } from '../backup/recovery-view.js';
import { mountDailyBackup } from '../backup/view.js';
import { mountWhatsApp } from '../../../../modules/whatsapp/src/view.js';
import { mountReview } from '../../../../modules/reading/src/review/view.js';
import { mountReader } from '../../../../modules/reading/src/view.js';
import { mountReaderPreferences } from '../../../../modules/reading/src/preferences.js';
import { mountPiano } from '../../../../modules/piano/src/view.js';
import { mountTimeBudget } from '../../../../modules/time-budget/src/view.js';
import { captureDrafts, restoreDrafts } from '../../../../packages/ui/src/drafts.js';
import { mountPlants } from '../../../../modules/plants/src/ui/view.js';
import { mountCoffee } from '../../../../modules/coffee/src/view.js';
import { mountGames } from '../../../../modules/games/src/view.js';
import { activitySummary } from './activity-summary.js';
import { shellText } from '../../../../packages/i18n/src/shell.js';
import { element, link } from './elements.js';
import { navigation } from './navigation.js';
import { dashboard } from './dashboard.js';
import { settings } from './settings.js';
import { modulePlaceholder } from './module-placeholder.js';
import { sidebar, menuBackdrop } from './sidebar.js';
import { syncSidebar } from './sidebar-controls.js';
import { shellFooter } from './footer.js';
function focusKey() {
    return document.activeElement instanceof HTMLElement ? document.activeElement.dataset.focus : undefined;
}
function focusAfterRender(root, key, changedRoute) {
    if (changedRoute)
        root.querySelector('h1')?.focus();
    else if (key)
        root.querySelector(`[data-focus="${CSS.escape(key)}"]`)?.focus();
}
function failure(context) {
    context.menuOpen = false;
    context.root.dataset.menuOpen = 'false';
    context.pageCleanup?.();
    context.pageCleanup = undefined;
    context.pageRestore = undefined;
    const service = connectRecoveryBackups(localStorage, { afterRestore: context.reading.releaseCredentials });
    const page = mountStorageRecovery({
        base: context.base, language: navigator.language.startsWith('es') ? 'es' : 'en', service,
        restore: preview => service.applyImport(preview),
        replaced: message => {
            context.route = parseHash('#/settings');
            history.replaceState(null, '', `${context.base}#/settings`);
            replaced(context, message);
        },
    });
    context.pageCleanup = page.dispose;
    context.pageConflict = page.conflict;
    context.root.replaceChildren(page.node);
    document.dispatchEvent(new Event('daily:form-state'));
}

function pageView(context, preferences) {
    if (context.route.page.startsWith('piano')) return pianoPage(context);
    if (context.route.page === 'time') return timePage(context);
    if (context.route.page.startsWith('game')) return gamePage(context);
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
        return dashboard(preferences, context.base, { state: context.state, plants: context.plants, piano: context.piano, reading: context.reading });
    if (['reader', 'review', 'settings', 'whatsapp'].includes(context.route.page))
        return utilityPage(context, preferences);
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
        const skip = link(copy.skip, '#content', 'skip-link');
        skip.dataset.skip = '';
        context.root.replaceChildren(skip, navigation(preferences.language, context.base), sidebar(context, copy), menuBackdrop(copy), activitySummary({ state: context.state, language: preferences.language, base: context.base }, true), main, shellFooter(context, copy));
        syncSidebar(context);
        focusAfterRender(context.root, key, changedRoute);
        restoreDrafts(context.root, drafts);
        context.pageRestore?.();
        document.dispatchEvent(new Event('daily:form-state'));
    }
    catch {
        failure(context);
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

function timePage(context) {
    context.timeUI ??= {};
    const page = mountTimeBudget({ service: context.timeBudget, ui: context.timeUI });
    context.pageCleanup = page.dispose;
    context.pageConflict = page.conflict;
    context.pageRestore = page.restore;
    return page.node;
}

function pianoPage(context) {
    const page = mountPiano({ route: context.route, base: context.base, service: context.piano, ui: context.moduleUI });
    context.pageCleanup = page.dispose;
    context.pageConflict = page.conflict;
    context.pageRestore = page.restore;
    return page.node;
}

function gamePage(context) {
    context.gamesUI ??= {};
    const page = mountGames({ route: context.route, base: context.base, service: context.games, ui: context.gamesUI });
    context.pageCleanup = page.dispose;
    context.pageConflict = page.conflict;
    context.pageRestore = page.restore;
    return page.node;
}

function utilityPage(context, preferences) {
    const options = { route: context.route, base: context.base, service: context[context.route.page === 'whatsapp' ? 'whatsapp' : 'reading'], ui: context.moduleUI };
    const mounts = { reader: mountReader, review: mountReview, settings: mountReaderPreferences, whatsapp: mountWhatsApp };
    const page = mounts[context.route.page](options);
    context.pageCleanup = page.dispose;
    context.pageRestore = page.restore;
    context.pageConflict = page.conflict;
    if (context.route.page !== 'settings') return page.node;
    const view = settings(preferences);
    view.append(page.node, backupPage(context));
    return view;
}

function backupPage(context) {
    context.backupUI ??= {};
    const options = {
        base: context.base, ui: context.backupUI, service: context.backups,
        restore: preview => { context.restoring = true; try { context.backups.applyImport(preview); } finally { context.restoring = false; } },
        replaced: message => replaced(context, message),
    };
    const page = mountDailyBackup(options);
    const previous = context.pageCleanup;
    context.pageCleanup = () => { previous?.(); page.dispose(); };
    return page.node;
}

function replaced(context, message) {
    Object.assign(context, { backupUI: { message }, moduleUI: {}, timeUI: {}, gamesUI: {}, error: false, saved: true });
    renderShell(context, true);
}
