import { activityTime, validateActivities } from '../../../packages/platform/src/activity-types.js';

function activityFor(session, now) {
  const task = session.tasks[session.currentTaskIndex];
  return {
    id: `budget:${session.id}`, kind: 'budget', reference: session.id, label: task.name,
    durationMs: task.allocatedMinutes * 60000, startedAt: session.startTime, updatedAt: now,
    status: session.timerRunning ? 'running' : 'paused',
    elapsedMs: session.timerRunning ? 0 : session.timerElapsed,
    resumedAt: session.timerRunning ? session.timerStartTime : null,
  };
}
export function synchronizeBudgetActivities(existing, session, replace = false) {
  const now = Date.now();
  const unfinished = existing.find(item => item.kind === 'budget' && item.status !== 'completed');
  if (session && unfinished && unfinished.reference !== session.id && !replace) throw new Error('Another time budget is already active.');
  const retained = existing.map(item => {
    if (item.kind !== 'budget' || item.status === 'completed') return item;
    return { ...item, status: 'completed', resumedAt: null, elapsedMs: activityTime(item, now).elapsedMs, updatedAt: now };
  }).filter(item => !session || item.id !== `budget:${session.id}`);
  if (session) retained.push(activityFor(session, now));
  if (!validateActivities(retained)) throw new Error('Invalid shared budget activity.');
  return retained;
}
