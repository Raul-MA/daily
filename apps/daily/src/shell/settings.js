import { widgetIds, quickIds } from '../../../../packages/data/src/daily-document.js';
import { shellText } from '../../../../packages/i18n/src/shell.js';
import { element, heading } from './elements.js';
import { settingsGroup } from './settings-hub.js';
import { quickLabel } from './dashboard.js';
function choice(id, label, checked, kind) {
    const wrapper = element('label', 'setting-choice');
    const input = element('input');
    input.type = 'checkbox';
    input.checked = checked;
    input.dataset[kind] = id;
    input.dataset.focus = `${kind}-${id}`;
    wrapper.append(input, element('span', '', label));
    return wrapper;
}
function move(id, direction, disabled, copy) {
    const button = element('button', 'move-button', direction === 'up' ? '↑' : '↓');
    button.type = 'button';
    button.disabled = disabled;
    button.setAttribute('aria-label', copy[direction === 'up' ? 'moveUp' : 'moveDown'].replace('{name}', copy[id]));
    button.dataset.move = direction;
    button.dataset.widget = id;
    button.dataset.focus = `move-${direction}-${id}`;
    return button;
}
function widgetSettings(preferences, copy) {
    const section = element('fieldset', 'settings-panel');
    section.append(element('legend', '', copy.widgets), element('p', 'widget-note', copy.chooseWidgets));
    const order = [...preferences.widgets, ...widgetIds.filter(id => !preferences.widgets.includes(id))];
    for (const id of order) {
        const index = preferences.widgets.indexOf(id);
        const row = element('div', 'setting-row');
        row.append(choice(id, copy[id], index >= 0, 'widgetChoice'));
        if (index >= 0) {
            const controls = element('span', 'move-controls');
            controls.append(move(id, 'up', index === 0, copy), move(id, 'down', index === preferences.widgets.length - 1, copy));
            row.append(controls);
        }
        section.append(row);
    }
    return section;
}
export function settings(preferences) {
    const copy = shellText(preferences.language);
    const view = element('div', 'settings-view');
    view.append(heading(copy.settings), element('p', 'widget-note', copy.settingsIntro));
    const language = element('label', 'settings-language', copy.language);
    const select = element('select');
    select.id = 'shell-language';
    select.setAttribute('aria-label', copy.language);
    select.dataset.focus = 'shell-language';
    for (const [value, title] of [['en', 'English'], ['es', 'Español']]) {
        const option = element('option', '', title);
        option.value = value;
        select.append(option);
    }
    select.value = preferences.language;
    language.append(select);
    const quick = element('fieldset', 'settings-panel');
    quick.append(element('legend', '', copy.quick));
    for (const id of quickIds)
        quick.append(choice(id, quickLabel(id, copy), preferences.quickActions.includes(id), 'quickChoice'));
    const daily = settingsGroup('daily-settings', 'Daily', copy.dailyNote);
    daily.append(language, widgetSettings(preferences, copy), quick);
    view.append(daily);
    return view;
}
