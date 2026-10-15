import { higherScoreLeads } from '../../backend/features/sessions.js';

export function getRoundSummary(session, round) {
  const scores = session.participants.map((participant) => ({
    name: participant.nameSnapshot,
    score: Number(round.scores[participant.playerId] || 0)
  }));
  if (!scores.length) return "No scores yet";
  const sorted = [...scores].sort((a, b) => (higherScoreLeads(session) ? b.score - a.score : a.score - b.score));
  const best = sorted[0];
  const total = scores.reduce((sum, item) => sum + item.score, 0);
  return `${best.name} leads with ${best.score} - round total ${total}`;
}
