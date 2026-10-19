import { validateActivities } from '../../../packages/platform/src/activity-types.js';
import { lessonFor } from './persistent-prompt.js';

function activityFor(record, now, completed = false) {
  return {
    id: `piano:${record.id}`, kind: 'piano', reference: record.id, label: lessonFor(record.lessonId).title,
    durationMs: record.minutes * 60000, startedAt: record.startedAt, updatedAt: now,
    status: completed ? 'completed' : record.status, elapsedMs: record.elapsedMs,
    resumedAt: completed ? null : record.resumedAt,
  };
}
export function synchronizePianoActivities(existing, data, now) {
  const history = new Map(data.history.map(record => [record.id, record]));
  const active = existing.find(item => item.kind === 'piano' && item.status !== 'completed');
  assertActiveReference(active, data.practice, history);
  const retained = existing.filter(item => item.kind !== 'piano');
  for (const item of existing.filter(item => item.kind === 'piano')) {
    if (history.has(item.reference)) retained.push(activityFor(history.get(item.reference), now, true));
  }
  if (data.practice) retained.push(activityFor(data.practice, now));
  if (!validateActivities(retained)) throw new Error('Invalid shared piano activity.');
  return retained;
}
function assertActiveReference(active, practice, history) {
  if (active && active.reference !== practice?.id && !history.has(active.reference)) throw new Error('Another piano practice is already active.');
}
