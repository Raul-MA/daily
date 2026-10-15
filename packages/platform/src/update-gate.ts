export function updateAllowed(state: { dirty: boolean; activities: readonly { status: string }[] }) {
  return !state.dirty && state.activities.every(item => item.status === 'completed');
}
