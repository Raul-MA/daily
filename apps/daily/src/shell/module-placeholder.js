import { element, heading, link } from './elements.js';
import { apps } from './catalog.js';
export function modulePlaceholder(route, copy, base) {
    const app = apps.find(app => app.pages.includes(route.page));
    const view = element('div', 'module-placeholder');
    if (!app) {
        view.append(heading(copy.notFound));
        return view;
    }
    const title = route.page === 'review' ? copy.openReview : copy[app.key];
    view.append(heading(title), element('p', 'widget-note', copy.pending));
    if (route.id) {
        const id = element('code', 'route-id', route.id);
        id.dataset.routeId = '';
        view.append(id);
    }
    if (app.key === 'reader') {
        view.append(link(copy.diagnostic, `${base}diagnostics.html`));
        if (route.page === 'review')
            view.append(link(copy.openReview, 'https://readwise.io/dailyreview'));
    }
    return view;
}
