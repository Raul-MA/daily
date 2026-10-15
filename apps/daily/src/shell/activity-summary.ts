import { createActivities, activityTime } from '../../../../packages/platform/src/activities.ts';
import type { Activity } from '../../../../packages/platform/src/activity-types.ts';
import { href } from '../../../../packages/platform/src/router.ts';
import type { DailyState } from '../../../../packages/data/src/daily-state.ts';
import type { Language } from '../../../../packages/data/src/daily-document.ts';
import { element, link } from './elements.ts';

type SummaryContext = { state: DailyState; language: Language; base: string };

function activityHref(item: Activity, base: string) {
  if (item.kind === 'game') return href({ page: 'gameSession', id: item.reference }, base);
  if (item.kind === 'piano') return href({ page: 'piano', query: { activity: item.id } }, base);
  return href({ page: 'time', query: { activity: item.id } }, base);
}

function timeLabel(item: Activity, language: Language) {
  const time = activityTime(item, Date.now());
  const seconds = Math.floor(Math.abs(time.remainingMs ?? time.elapsedMs) / 1000);
  const value = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  if (item.status === 'paused') return `${language === 'es' ? 'Pausa' : 'Paused'} · ${value}`;
  if (time.overdue) return `${language === 'es' ? 'Tiempo excedido' : 'Overdue'} · ${value}`;
  return value;
}

export function activitySummary(context: SummaryContext, compact = false) {
  const section = element(compact ? 'nav' : 'div', compact ? 'running-indicator' : 'running-list');
  if (compact) section.setAttribute('aria-label', message(context.language, 'running'));
  try {
    fillActivities(section, context, compact);
  } catch {
    section.append(element('p', 'widget-note', message(context.language, 'error')));
  }
  return section;
}

export function refreshActivityTimes(root: HTMLElement, state: DailyState) {
  try {
    const items = createActivities(state).list();
    const language = state.read().value.preferences.language;
    for (const node of root.querySelectorAll<HTMLElement>('[data-activity-time]')) {
      const item = items.find(item => item.id === node.dataset.activityTime);
      if (item) node.textContent = timeLabel(item, language);
    }
  } catch {
    return;
  }
}

function message(language: Language, key: 'empty' | 'running' | 'error') {
  const en = { empty: 'No activities running.', running: 'Running activities', error: 'Saved activities could not be read.' };
  const es = { empty: 'No hay actividades en marcha.', running: 'Actividades en marcha', error: 'No se pudieron leer las actividades guardadas.' };
  return (language === 'es' ? es : en)[key];
}

function activityEntry(item: Activity, context: SummaryContext) {
  const entry = link('', activityHref(item, context.base), 'activity-link');
  const time = element('span', 'activity-time', timeLabel(item, context.language));
  time.dataset.activityTime = item.id;
  entry.append(element('span', '', item.label), time);
  return entry;
}

function fillActivities(section: HTMLElement, context: SummaryContext, compact: boolean) {
  const active = createActivities(context.state).list().filter(item => item.status !== 'completed');
  for (const item of active) section.append(activityEntry(item, context));
  if (!active.length && !compact) section.append(element('p', 'widget-note', message(context.language, 'empty')));
  section.hidden = compact && active.length === 0;
}
