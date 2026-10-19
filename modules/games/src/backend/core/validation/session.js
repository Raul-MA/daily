import { isPlainObject } from './common.js';

export function validateSession(session, data) {
 const value = session ?? {};
 const errors = [];
 if (!session || typeof session !== 'object') errors.push('Session is required.');
 if (!hasSessionGame(value, data)) errors.push('Session game is missing.');
 errors.push(...sessionPlayerErrors(value), ...sessionStatusErrors(value, data), ...sessionTimingErrors(value));
 errors.push(...scoreErrors(value.rounds));
 return [...new Set(errors)];
}

function scoreErrors(rounds) {
 const errors = [];
 for (const round of Array.isArray(rounds) ? rounds : []) {
  const scores = isPlainObject(round?.scores) ? round.scores : {};
  if (Object.values(scores).some(score => !Number.isInteger(Number(score)))) errors.push('Scores must be whole numbers.');
 }
 return errors;
}

export function hasSessionGame(session, data) { return Array.isArray(data?.games) && data.games.some(game => game?.id === session.gameId); }

export function sessionPlayerErrors(session) {
 const minimum = session.isCollaborative ? 1 : 2;
 const errors = [];
 if (!Array.isArray(session.participants) || session.participants.length < minimum) errors.push(session.isCollaborative ? 'Choose at least one player.' : 'Choose at least two players.');
 if (session.isCollaborative && !['', 'win', 'loss'].includes(session.collaborativeOutcome ?? '')) errors.push('Choose a valid team result.');
 return errors;
}

export function sessionStatusErrors(session, data) {
 const multiple = Array.isArray(data?.sessions) && data.sessions.some(item => item?.id !== session.id && item?.status === 'active');
 return session.status === 'active' && multiple ? ['Only one active session is allowed.'] : [];
}

export function sessionTimingErrors(session) {
 const errors = [];
 if (session.startedAt && Number.isNaN(new Date(session.startedAt).getTime())) errors.push('Session start time is invalid.');
 if (session.completedAt && Number.isNaN(new Date(session.completedAt).getTime())) errors.push('Session end time is invalid.');
 if (invalidTimeOrder(session)) errors.push('Session end time must be after start time.');
 if (invalidDuration(session.durationMinutesOverride)) errors.push('Session duration must be a non-negative whole number.');
 return errors;
}

export function invalidTimeOrder(session) { return session.startedAt && session.completedAt && new Date(session.completedAt) < new Date(session.startedAt); }

export function invalidDuration(value) { return value != null && (!Number.isInteger(Number(value)) || Number(value) < 0); }
