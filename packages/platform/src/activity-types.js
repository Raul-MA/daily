function finite(value) { return typeof value === 'number' && Number.isFinite(value) && value >= 0; }
function text(value) { return typeof value === 'string' && value.trim().length > 0 && value.length <= 500; }
export function activityStatus(value) { return value === 'running' || value === 'paused' || value === 'completed'; }
export function validDuration(value) { return value === null || finite(value); }
export function validInput(value) {
    return text(value.id) && text(value.label) && text(value.reference)
        && ['budget', 'countdown', 'game', 'piano'].includes(value.kind) && validDuration(value.durationMs);
}
function validActivity(value) {
    if (typeof value !== 'object' || value === null)
        return false;
    const item = value;
    if (!validInput(item) || !activityStatus(item.status))
        return false;
    if (![item.startedAt, item.updatedAt, item.elapsedMs].every(finite))
        return false;
    return item.status === 'running' ? finite(item.resumedAt) : item.resumedAt === null;
}
export function validateActivities(value) {
    if (!Array.isArray(value) || !value.every(validActivity))
        return false;
    const active = value.filter(item => item.status !== 'completed' && item.kind !== 'countdown');
    return new Set(value.map(item => item.id)).size === value.length && new Set(active.map(item => item.kind)).size === active.length;
}
export function activityTime(activity, now) {
    const active = activity.status === 'running' && activity.resumedAt !== null ? Math.max(0, now - activity.resumedAt) : 0;
    const elapsedMs = activity.elapsedMs + active;
    const remainingMs = activity.durationMs === null ? null : activity.durationMs - elapsedMs;
    return { elapsedMs, remainingMs, overdue: remainingMs !== null && remainingMs < 0 };
}
