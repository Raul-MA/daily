export type ActivityKind = 'budget' | 'countdown' | 'game' | 'piano';
export type ActivityStatus = 'running' | 'paused' | 'completed';
export type ActivityInput = { id: string; kind: ActivityKind; label: string; durationMs: number | null; reference: string };
export type Activity = ActivityInput & { status: ActivityStatus; startedAt: number; resumedAt: number | null; elapsedMs: number; updatedAt: number };

function finite(value: unknown): value is number { return typeof value === 'number' && Number.isFinite(value) && value >= 0; }
function text(value: unknown): value is string { return typeof value === 'string' && value.trim().length > 0 && value.length <= 500; }
export function activityStatus(value: unknown): value is ActivityStatus { return value === 'running' || value === 'paused' || value === 'completed'; }
export function validDuration(value: unknown): value is number | null { return value === null || finite(value); }

export function validInput(value: ActivityInput) {
  return text(value.id) && text(value.label) && text(value.reference)
    && ['budget', 'countdown', 'game', 'piano'].includes(value.kind) && validDuration(value.durationMs);
}

function validActivity(value: unknown): value is Activity {
  if (typeof value !== 'object' || value === null) return false;
  const item = value as Activity;
  if (!validInput(item) || !activityStatus(item.status)) return false;
  if (![item.startedAt, item.updatedAt, item.elapsedMs].every(finite)) return false;
  return item.status === 'running' ? finite(item.resumedAt) : item.resumedAt === null;
}

export function validateActivities(value: unknown): value is Activity[] {
  if (!Array.isArray(value) || !value.every(validActivity)) return false;
  const active = value.filter(item => item.status !== 'completed' && item.kind !== 'countdown');
  return new Set(value.map(item => item.id)).size === value.length && new Set(active.map(item => item.kind)).size === active.length;
}

export function activityTime(activity: Activity, now: number) {
  const active = activity.status === 'running' && activity.resumedAt !== null ? Math.max(0, now - activity.resumedAt) : 0;
  const elapsedMs = activity.elapsedMs + active;
  const remainingMs = activity.durationMs === null ? null : activity.durationMs - elapsedMs;
  return { elapsedMs, remainingMs, overdue: remainingMs !== null && remainingMs < 0 };
}
