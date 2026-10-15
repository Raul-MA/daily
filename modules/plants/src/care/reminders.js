import { getPlants } from '../store/store.js';
import { getStatus } from './care.js';

const TASK_TYPES = ['watering', 'soil', 'fertilizer'];

export function getReminderSummary(plants = getPlants()) {
  const tasks = plants.flatMap(plant =>
    TASK_TYPES.map(type => ({ plant, type, info: getStatus(plant, type) }))
  );
  const overdue = tasks.filter(task => task.info.status === 'overdue');
  const dueToday = tasks.filter(task => task.info.days === 0);
  return {
    overdueCount: overdue.length,
    dueTodayCount: dueToday.length,
    pendingCount: overdue.length + dueToday.length,
  };
}

export async function refreshReminderIndicators() {
  const summary = getReminderSummary();
  document.querySelectorAll('[data-reminder-count]').forEach(element => {
    element.textContent = String(summary.overdueCount);
    element.hidden = summary.overdueCount === 0;
    element.setAttribute(
      'aria-label',
      `${summary.overdueCount} tarea${summary.overdueCount === 1 ? '' : 's'} atrasada${summary.overdueCount === 1 ? '' : 's'}`
    );
  });

  try {
    if ('setAppBadge' in navigator) {
      if (summary.overdueCount > 0) await navigator.setAppBadge(summary.overdueCount);
      else await navigator.clearAppBadge?.();
    }
  } catch {
    return summary;
  }

  return summary;
}
