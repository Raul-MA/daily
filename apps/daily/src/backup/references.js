function active(data, kind) { return data.modules.activities?.data.filter(item => item.kind === kind && item.status !== 'completed') ?? []; }
function equalFields(actual, expected) { return Object.entries(expected).every(([key, value]) => actual[key] === value); }
function mirror(data, kind, record, expected) {
  const matches = active(data, kind);
  if (!record && matches.length) throw new Error(`Orphan ${kind} activity reference.`);
  if (!record) return;
  if (matches.length !== 1 || !equalFields(matches[0], expected)) throw new Error(`Invalid ${kind} activity timing mirror.`);
}
function budget(data) {
  const session = data.modules['time-budget']?.data.session;
  if (!session) return mirror(data, 'budget', null);
  const task = session.tasks[session.currentTaskIndex];
  mirror(data, 'budget', session, {
    id: `budget:${session.id}`, reference: session.id, startedAt: session.startTime,
    status: session.timerRunning ? 'running' : 'paused', durationMs: task.allocatedMinutes * 60000,
    resumedAt: session.timerRunning ? session.timerStartTime : null, elapsedMs: session.timerRunning ? 0 : session.timerElapsed,
  });
}
function game(data) {
  const sessions = data.modules.games?.data.sessions.filter(item => item.status === 'active') ?? [];
  if (sessions.length > 1) throw new Error('More than one active game session.');
  const session = sessions[0];
  if (!session) return mirror(data, 'game', null);
  const startedAt = Date.parse(session.startedAt);
  mirror(data, 'game', session, { id: `game:${session.id}`, reference: session.id, startedAt, resumedAt: startedAt, status: 'running', durationMs: null, elapsedMs: 0 });
}
function piano(data) {
  const practice = data.modules.piano?.data.practice;
  if (!practice) return mirror(data, 'piano', null);
  mirror(data, 'piano', practice, { id: `piano:${practice.id}`, reference: practice.id, startedAt: practice.startedAt, resumedAt: practice.resumedAt, elapsedMs: practice.elapsedMs, status: practice.status, durationMs: practice.minutes * 60000 });
}
export function assertActivityReferences(data) { budget(data); game(data); piano(data); }
