import type { DailyState } from '../../../../packages/data/src/daily-state.ts';
import { activitySummary } from './activity-summary.ts';
import { href } from '../../../../packages/platform/src/router.ts';
import { shellText } from '../../../../packages/i18n/src/shell.ts';
import type { Preferences, WidgetId, QuickId } from '../../../../packages/data/src/daily-document.ts';
import type { ShellText } from '../../../../packages/i18n/src/shell.ts';
import { element, heading, arrowLink } from './elements.ts';
import { badge } from './icons.ts';
import { quickActions, widgets } from './catalog.ts';

export function quickLabel(id: QuickId, copy: ShellText) { return copy[quickActions[id].label]; }

function quickCard(preferences: Preferences, base: string) {
  const copy = shellText(preferences.language);
  const content = element('div', 'quick-links');
  for (const id of preferences.quickActions) {
    content.append(arrowLink(quickLabel(id, copy), href(quickActions[id], base)));
  }
  if (!preferences.quickActions.length) content.append(element('p', 'widget-note', copy.noActions));
  content.append(arrowLink(copy.scheduleMessage, href({ page: 'whatsapp' }, base)));
  return content;
}

function card(id: WidgetId, preferences: Preferences, base: string, state: DailyState) {
  const copy = shellText(preferences.language);
  const node = element('section', 'dashboard-card');
  node.dataset.widget = id;
  const title = element('h2', 'widget-title', copy[id]);
  title.id = `widget-${id}`;
  const header = element('div', 'card-heading');
  header.append(badge(id), title);
  node.setAttribute('aria-labelledby', title.id);
  node.append(header);
  if (id === 'quick') node.append(quickCard(preferences, base));
  else if (id === 'activities') node.append(activitySummary({ state, language: preferences.language, base }));
  else {
    const metadata = widgets[id];
    node.append(element('p', 'widget-note', copy[metadata.note]), arrowLink(copy[metadata.label], href({ page: metadata.page }, base)));
  }
  return node;
}

export function dashboard(preferences: Preferences, base: string, state: DailyState) {
  const copy = shellText(preferences.language);
  const view = element('div');
  const title = element('div', 'daily-title');
  const date = element('time', 'date-label', new Intl.DateTimeFormat(preferences.language, { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date()));
  date.dateTime = new Date().toISOString();
  title.append(date, heading(copy.today));
  const grid = element('div', 'dashboard-grid');
  grid.id = 'dashboard';
  for (const id of preferences.widgets) grid.append(card(id, preferences, base, state));
  if (!preferences.widgets.length) grid.append(element('p', 'empty-note', copy.noWidgets));
  view.append(title, grid);
  return view;
}
