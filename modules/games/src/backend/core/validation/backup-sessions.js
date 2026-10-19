import { isPlainObject, recordIdErrors, participantIdErrors, nonEmptyString, getSessionParticipants, competitiveOutcome } from './common.js';
import { validateSession } from './session.js';

export function validateBackupSessions(backup) {
  const errors = [];
  const seenIds = new Set();
  const gameIds = new Set(backup.games.map((game) => game?.id));
  const playerIds = new Set(backup.players.map((player) => player?.id));
  backup.sessions.forEach((session, index) => {
    const label = `Backup session ${index + 1}`;
    if (!isPlainObject(session)) {
      errors.push(`${label} must be an object.`);
      return;
    }
    errors.push(...recordIdErrors(session.id, seenIds, label, 'Backup session IDs must be unique.'));
    errors.push(...sessionHeaderErrors(session, label, { backup, gameIds }));
    errors.push(...validateBackupParticipants(session, label, playerIds));
    errors.push(...validateBackupRounds(session, label));
    errors.push(...validateBackupResults(session, label));
    errors.push(...validateBackupWinners(session, label));
    errors.push(...validateSession(session, backup).map((message) => `${label}: ${message}`));
  });
  return errors;
}

export function validateBackupParticipants(session, label, playerIds) {
  const errors = [];
  if (!Array.isArray(session.participants)) return errors;
  const participantIds = new Set();
  session.participants.forEach((participant, index) => {
    if (!isPlainObject(participant)) {
      errors.push(`${label} participant ${index + 1} must be an object.`);
      return;
    }
    errors.push(...participantIdErrors(participant.playerId, participantIds, label, index));
    if (nonEmptyString(participant.playerId) && !playerIds.has(participant.playerId)) {
      errors.push(`${label} participant ${index + 1} references a missing player.`);
    }
    if (!nonEmptyString(participant.nameSnapshot)) errors.push(`${label} participant ${index + 1} is missing nameSnapshot.`);
    if (!Number.isInteger(Number(participant.seatOrder))) errors.push(`${label} participant ${index + 1} has invalid seatOrder.`);
  });
  return errors;
}

export function validateBackupRounds(session, label) {
  const errors = [];
  if (!Array.isArray(session.rounds)) {
    errors.push(`${label} rounds must be an array.`);
    return errors;
  }
  if ((session.isCollaborative || session.scoringMode === "win_loss_tie") && session.rounds.length) {
    errors.push(`${label} outcome sessions cannot contain rounds.`);
  }
  if (!session.isCollaborative && session.scoringMode !== "win_loss_tie" && !session.rounds.length) {
    errors.push(`${label} score sessions must contain at least one round.`);
  }
  const participantIds = new Set(getSessionParticipants(session).map((participant) => participant.playerId));
  session.rounds.forEach((round, index) => {
    if (!isPlainObject(round)) {
      errors.push(`${label} round ${index + 1} must be an object.`);
      return;
    }
    if (!nonEmptyString(round.id)) errors.push(`${label} round ${index + 1} is missing id.`);
    if (!Number.isInteger(Number(round.roundNumber)) || Number(round.roundNumber) < 1) {
      errors.push(`${label} round ${index + 1} has invalid roundNumber.`);
    }
    if (!isPlainObject(round.scores)) {
      errors.push(`${label} round ${index + 1} scores must be an object.`);
      return;
    }
    Object.entries(round.scores).forEach(([playerId, score]) => {
      if (!participantIds.has(playerId)) errors.push(`${label} round ${index + 1} contains a score for a non-participant.`);
      if (!Number.isInteger(Number(score))) errors.push(`${label} round ${index + 1} scores must be whole numbers.`);
    });
  });
  return errors;
}

export function validateBackupResults(session, label) {
  const errors = [];
  if (!Array.isArray(session.results)) {
    errors.push(`${label} results must be an array.`);
    return errors;
  }
  if (!competitiveOutcome(session) && session.results.length) {
    errors.push(`${label} non-competitive outcome sessions cannot contain per-player results.`);
  }
  if (competitiveOutcome(session) && session.results.length !== getSessionParticipants(session).length) {
    errors.push(`${label} must have one result per participant.`);
  }
  const participantIds = new Set(getSessionParticipants(session).map((participant) => participant.playerId));
  session.results.forEach((result, index) => {
    if (!isPlainObject(result)) {
      errors.push(`${label} result ${index + 1} must be an object.`);
      return;
    }
    if (!participantIds.has(result.playerId)) errors.push(`${label} result ${index + 1} references a non-participant.`);
    if (!["", "win", "loss", "tie"].includes(result.outcome)) errors.push(`${label} result ${index + 1} has an invalid outcome.`);
  });
  return errors;
}

export function validateBackupWinners(session, label) {
  const errors = [];
  if (!Array.isArray(session.winnerPlayerIds)) {
    errors.push(`${label} winnerPlayerIds must be an array.`);
    return errors;
  }
  const participantIds = new Set(getSessionParticipants(session).map((participant) => participant.playerId));
  session.winnerPlayerIds.forEach((playerId) => {
    if (!participantIds.has(playerId)) errors.push(`${label} winnerPlayerIds references a non-participant.`);
  });
  if (session.isCollaborative && session.winnerPlayerIds.length) {
    errors.push(`${label} collaborative sessions cannot have individual winners.`);
  }
  errors.push(...collaborativeWinnerErrors(session, label));
  return errors;
}

export function sessionHeaderErrors(session, label, context) {
 const errors = [];
 if (!context.gameIds.has(session.gameId)) errors.push(label + ' references a missing game.');
 if (!['active', 'completed'].includes(session.status)) errors.push(label + ' has an invalid status.');
 if (!nonEmptyString(session.startedAt)) errors.push(label + ' is missing startedAt.');
 if (session.status === 'completed' && !nonEmptyString(session.completedAt)) errors.push(label + ' is missing completedAt.');
 if (session.status === 'active' && context.backup.sessions.some(item => item !== session && item?.status === 'active')) errors.push('Only one active session is allowed.');
 return errors;
}

export function collaborativeWinnerErrors(session, label) {
 const errors = [];
  if (session.isCollaborative) {
    const outcome = session.collaborativeOutcome ?? "";
    if (!["", "win", "loss"].includes(outcome)) errors.push(`${label} has an invalid team result.`);
    if (session.status === "completed" && !["win", "loss"].includes(outcome)) {
      errors.push(`${label} completed collaborative sessions must have a team result.`);
    }
  }
 return errors;
}
