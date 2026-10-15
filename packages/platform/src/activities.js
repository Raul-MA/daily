import { createModuleStore } from '../../data/src/module-store.js';
import { validateActivities, validInput, activityStatus, validDuration, activityTime } from './activity-types.js';
export { activityTime } from './activity-types.js';
export function createActivities(state, clock = Date.now) {
    const store = createModuleStore(state, { id: 'activities', version: 1, validate: validateActivities, initial: () => [] });
    function start(input) {
        if (!validInput(input))
            throw new Error('Invalid activity.');
        const current = store.read();
        if (current.some(item => item.id === input.id))
            throw new Error('Duplicate activity ID.');
        const existing = current.find(item => item.kind === input.kind && item.status !== 'completed');
        if (existing && input.kind !== 'countdown')
            return existing;
        const now = clock();
        const item = { ...input, startedAt: now, resumedAt: now, updatedAt: now, elapsedMs: 0, status: 'running' };
        store.save([...current, item]);
        return item;
    }
    function change(id, transform) {
        const current = store.read();
        if (!current.some(item => item.id === id))
            throw new Error('Unknown activity.');
        const now = clock();
        store.save(current.map(item => item.id === id ? transform(item, now) : item));
    }
    function transition(id, status) {
        if (!activityStatus(status))
            throw new Error('Invalid activity status.');
        change(id, (item, now) => {
            if (item.status === 'completed')
                throw new Error('Activity is completed.');
            return { ...item, status, elapsedMs: activityTime(item, now).elapsedMs, resumedAt: status === 'running' ? now : null, updatedAt: now };
        });
    }
    function adjust(id, durationMs) {
        if (!validDuration(durationMs))
            throw new Error('Invalid activity duration.');
        change(id, (item, now) => ({ ...item, durationMs, updatedAt: now }));
    }
    return { list: store.read, start, transition, adjust };
}
