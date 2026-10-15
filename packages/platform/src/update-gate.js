export function updateAllowed(state) {
    return !state.dirty && state.activities.every(item => item.status === 'completed');
}
