import { isLanguage, widgetIds, quickIds } from '../../../../packages/data/src/daily-document.js';
function reorder(state, id, direction) {
    const order = state.read().value.preferences.widgets;
    const index = order.indexOf(id);
    const destination = index + (direction === 'up' ? -1 : 1);
    if (index < 0 || destination < 0 || destination >= order.length)
        return;
    const next = [...order];
    next.splice(index, 1);
    next.splice(destination, 0, id);
    state.updatePreferences({ widgets: next });
}
export function handleClick(event, state) {
    if (!(event.target instanceof Element))
        return;
    const button = event.target.closest('button');
    if (!button)
        return;
    if (isLanguage(button.dataset.language))
        state.updatePreferences({ language: button.dataset.language });
    const id = button.dataset.widget;
    if (button.dataset.move && widgetIds.includes(id))
        reorder(state, id, button.dataset.move);
}
function languageChange(input, state) {
    if (input instanceof HTMLSelectElement && input.id === 'shell-language' && isLanguage(input.value)) {
        state.updatePreferences({ language: input.value });
    }
}
export function handleChange(event, state) {
    const input = event.target;
    languageChange(input, state);
    if (!(input instanceof HTMLInputElement))
        return;
    const widget = input.dataset.widgetChoice;
    const quick = input.dataset.quickChoice;
    if (!widgetIds.includes(widget) && !quickIds.includes(quick)) return;
    const preferences = state.read().value.preferences;
    if (widgetIds.includes(widget)) {
        const list = preferences.widgets.filter(id => id !== widget);
        state.updatePreferences({ widgets: input.checked ? [...list, widget] : list });
    }
    if (quickIds.includes(quick)) {
        const list = preferences.quickActions.filter(id => id !== quick);
        state.updatePreferences({ quickActions: input.checked ? [...list, quick] : list });
    }
}
