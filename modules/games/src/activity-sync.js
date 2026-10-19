import { getDurationMinutes } from './backend/features/sessions.js';
import { validateActivities } from '../../../packages/platform/src/activity-types.js';

function activityFor(session, now) {
  const startedAt = Date.parse(session.startedAt);
  const completed = session.status === 'completed';
  return {
    id: `game:${session.id}`, kind: 'game', reference: session.id, label: session.gameNameSnapshot,
    durationMs: null, startedAt, updatedAt: now, status: completed ? 'completed' : 'running',
    resumedAt: completed ? null : startedAt, elapsedMs: completed ? getDurationMinutes(session) * 60000 : 0,
  };
}
export function synchronizeGameActivities(existing, data, options = {}) {
  const now = Date.now();
  const byId = new Map(data.sessions.map(session => [session.id, session]));
  const active = data.sessions.find(session => session.status === 'active');
  const others = existing.filter(activity => activity.kind !== 'game');
  const tracked = existing.filter(activity => activity.kind === 'game');
  if (!options.replace && active && tracked.some(activity => activity.status !== 'completed' && !byId.has(activity.reference))) throw new Error('Another game activity is already running.');
  const retained = tracked.filter(activity => byId.has(activity.reference)).map(activity => activityFor(byId.get(activity.reference), now));
  if (active && !retained.some(activity => activity.reference === active.id)) retained.push(activityFor(active, now));
  const result = [...others, ...retained];
  if (!validateActivities(result)) throw new Error('Invalid shared game activity.');
  return result;
}
