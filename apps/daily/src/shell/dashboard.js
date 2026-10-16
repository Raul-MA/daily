import { pianoWidget } from '../../../../modules/piano/src/widget.js';
import { plantWidget } from '../../../../modules/plants/src/ui/widget.js';
import { activitySummary } from './activity-summary.js';
import { href } from '../../../../packages/platform/src/router.js';
import { shellText } from '../../../../packages/i18n/src/shell.js';
import { element, heading, arrowLink } from './elements.js';
import { badge } from './icons.js';
import { quickActions, widgets } from './catalog.js';
export function quickLabel(id, copy) { return copy[quickActions[id].label]; }
function quickCard(preferences, base) {
    const copy = shellText(preferences.language);
    const content = element('div', 'quick-links');
    for (const id of preferences.quickActions) {
        content.append(arrowLink(quickLabel(id, copy), href(quickActions[id], base)));
    }
    if (!preferences.quickActions.length)
        content.append(element('p', 'widget-note', copy.noActions));
    content.append(arrowLink(copy.scheduleMessage, href({ page: 'whatsapp' }, base)));
    return content;
}
function card(id, preferences, base, services) {
    const copy = shellText(preferences.language);
    const node = element('section', 'dashboard-card');
    node.dataset.widget = id;
    const title = element('h2', 'widget-title', copy[id]);
    title.id = `widget-${id}`;
    const header = element('div', 'card-heading');
    header.append(badge(id), title);
    node.setAttribute('aria-labelledby', title.id);
    node.append(header);
    if (id === 'quick')
        node.append(quickCard(preferences, base));
    else if (id === 'activities')
        node.append(activitySummary({ state: services.state, language: preferences.language, base }));
    else if (id === 'piano') node.append(pianoWidget(services.piano, preferences.language, base), arrowLink(copy.openPiano, href({ page: 'piano' }, base)));
    else if (id === 'plants') {
        node.append(plantWidget({ service: services.plants, language: preferences.language, base }), arrowLink(copy.openPlants, href({ page: 'plants' }, base)));
    }
    else {
        const metadata = widgets[id];
        node.append(element('p', 'widget-note', copy[metadata.note]), arrowLink(copy[metadata.label], href({ page: metadata.page }, base)));
    }
    return node;
}
export function dashboard(preferences, base, services) {
    const copy = shellText(preferences.language);
    const view = element('div');
    const title = element('div', 'daily-title');
    const date = element('time', 'date-label', new Intl.DateTimeFormat(preferences.language, { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date()));
    date.dateTime = new Date().toISOString();
    title.append(date, heading(copy.today));
    const grid = element('div', 'dashboard-grid');
    grid.id = 'dashboard';
    for (const id of preferences.widgets)
        grid.append(card(id, preferences, base, services));
    if (!preferences.widgets.length)
        grid.append(element('p', 'empty-note', copy.noWidgets));
    view.append(title, grid);
    return view;
}
