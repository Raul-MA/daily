import type { DailyState } from '../../../../packages/data/src/daily-state.ts';
import { isLanguage, widgetIds, quickIds } from '../../../../packages/data/src/daily-document.ts';
import type { WidgetId, QuickId } from '../../../../packages/data/src/daily-document.ts';

function reorder(state: DailyState, id: WidgetId, direction: string) {
  const order = state.read().value.preferences.widgets;
  const index = order.indexOf(id);
  const destination = index + (direction === 'up' ? -1 : 1);
  if (index < 0 || destination < 0 || destination >= order.length) return;
  const next = [...order];
  next.splice(index, 1);
  next.splice(destination, 0, id);
  state.updatePreferences({ widgets: next });
}

export function handleClick(event: Event, state: DailyState) {
  if (!(event.target instanceof Element)) return;
  const button = event.target.closest('button');
  if (!button) return;
  if (isLanguage(button.dataset.language)) state.updatePreferences({ language: button.dataset.language });
  const id = button.dataset.widget as WidgetId;
  if (button.dataset.move && widgetIds.includes(id)) reorder(state, id, button.dataset.move);
}

function languageChange(input: EventTarget | null, state: DailyState) {
  if (input instanceof HTMLSelectElement && input.id === 'shell-language' && isLanguage(input.value)) {
    state.updatePreferences({ language: input.value });
  }
}

export function handleChange(event: Event, state: DailyState) {
  const input = event.target;
  languageChange(input, state);
  if (!(input instanceof HTMLInputElement)) return;
  const preferences = state.read().value.preferences;
  const widget = input.dataset.widgetChoice as WidgetId;
  if (widgetIds.includes(widget)) {
    const list = preferences.widgets.filter(id => id !== widget);
    state.updatePreferences({ widgets: input.checked ? [...list, widget] : list });
  }
  const quick = input.dataset.quickChoice as QuickId;
  if (quickIds.includes(quick)) {
    const list = preferences.quickActions.filter(id => id !== quick);
    state.updatePreferences({ quickActions: input.checked ? [...list, quick] : list });
  }
}
