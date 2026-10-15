import { getTotals } from '../../backend/features/sessions.js';

export function isTargetReached(session) {
  if (session?.scoringMode !== "first_to_points" || !session.targetScore) return false;
  const totals = getTotals(session);
  return session.participants.some((participant) => (totals[participant.playerId] || 0) >= session.targetScore);
}
