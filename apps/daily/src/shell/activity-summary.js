import { createActivities, activityTime } from '../../../../packages/platform/src/activities.js';
import { href } from '../../../../packages/platform/src/router.js';
import { element, link } from './elements.js';
function activityHref(item, base) {
    if (item.kind === 'game')
        return href({ page: 'gameSession', id: item.reference }, base);
    if (item.kind === 'piano')
        return href({ page: 'pianoLearn', query: { activity: item.reference } }, base);
    return href({ page: 'time', query: { activity: item.id } }, base);
}
function timeLabel(item, language) {
    const time = activityTime(item, Date.now());
    const seconds = Math.floor(Math.abs(time.remainingMs ?? time.elapsedMs) / 1000);
    const value = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
    if (item.status === 'paused')
        return `${language === 'es' ? 'Pausa' : 'Paused'} · ${value}`;
    if (time.overdue)
        return `${language === 'es' ? 'Tiempo excedido' : 'Overdue'} · ${value}`;
    return value;
}
export function activitySummary(context, compact = false) {
    const section = element(compact ? 'nav' : 'div', compact ? 'running-indicator' : 'running-list');
    if (compact)
        section.setAttribute('aria-label', message(context.language, 'running'));
    try {
        fillActivities(section, context, compact);
    }
    catch {
        section.append(element('p', 'widget-note', message(context.language, 'error')));
    }
    return section;
}
export function refreshActivityTimes(root, state) {
    try {
        const items = createActivities(state).list();
        const language = state.read().value.preferences.language;
        for (const node of root.querySelectorAll('[data-activity-time]')) {
            const item = items.find(item => item.id === node.dataset.activityTime);
            if (item)
                node.textContent = timeLabel(item, language);
        }
    }
    catch {
        return;
    }
}
function message(language, key) {
    const en = { empty: 'No activities running.', running: 'Running activities', error: 'Saved activities could not be read.' };
    const es = { empty: 'No hay actividades en marcha.', running: 'Actividades en marcha', error: 'No se pudieron leer las actividades guardadas.' };
    return (language === 'es' ? es : en)[key];
}
function activityEntry(item, context) {
    const entry = link('', activityHref(item, context.base), 'activity-link');
    const time = element('span', 'activity-time', timeLabel(item, context.language));
    time.dataset.activityTime = item.id;
    entry.append(element('span', '', item.label), time);
    return entry;
}
function fillActivities(section, context, compact) {
    const active = createActivities(context.state).list().filter(item => item.status !== 'completed');
    for (const item of active)
        section.append(activityEntry(item, context));
    if (!active.length && !compact)
        section.append(element('p', 'widget-note', message(context.language, 'empty')));
    section.hidden = compact && active.length === 0;
}
