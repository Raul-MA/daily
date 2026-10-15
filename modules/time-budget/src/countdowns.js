import { createActivities } from '../../../packages/platform/src/activities.js';

export function createCountdowns(state) {
  const activities = createActivities(state);
  function start(label, minutes) {
    if (typeof label !== 'string' || !label.trim()) throw new Error('Enter a countdown name.');
    if (!Number.isInteger(minutes) || minutes < 1 || minutes > 1440) throw new Error('Enter 1–1440 minutes.');
    const id = crypto.randomUUID();
    return activities.start({ id, kind: 'countdown', reference: id, label: label.trim(), durationMs: minutes * 60000 });
  }
  function transition(id, status) {
    if (!activities.list().some(item => item.id === id && item.kind === 'countdown')) throw new Error('Unknown countdown.');
    activities.transition(id, status);
  }
  return { list: () => activities.list().filter(item => item.kind === 'countdown'), start, transition };
}
