import { createId } from "../core/id.js";
import { saveData } from "../core/storage.js";
import { validateSession } from "../core/validation.js";

export function startSession(data, input) {
  const game = data.games.find((item) => item.id === input.gameId);
  if (!game) return { data, errors: ["Choose a game."] };
  if (data.sessions.some((session) => session.status === "active")) return { data, errors: ["Finish the active session first."] };
  const selectedPlayers = input.playerIds.map((id) => data.players.find((player) => player.id === id)).filter(Boolean);
  const now = new Date().toISOString();
  const session = {
    id: createId("session"),
    gameId: game.id,
    gameNameSnapshot: game.name,
    isCollaborative: Boolean(game.isCollaborative),
    collaborativeOutcome: "",
    scoringMode: game.scoringMode,
    participants: selectedPlayers.map((player, index) => ({
      playerId: player.id,
      nameSnapshot: player.name,
      seatOrder: index
    })),
    status: "active",
    startedAt: now,
    completedAt: null,
    roundCount:
      sessionOption(game, input, 'roundCount', 'highest_score_after_rounds'),
    targetScore:
      sessionOption(game, input, 'targetScore', 'first_to_points'),
    higherScoreWins: game.higherScoreWins,
    rounds: initialRounds(game, selectedPlayers),
    results:
      initialResults(game, selectedPlayers),
    winnerPlayerIds: [],
    notes: "",
    createdAt: now,
    updatedAt: now
  };
  const errors = validateSession(session, data);
  if (errors.length) return { data, errors };
  return touchAndSave({ ...data, sessions: [session, ...data.sessions] });
}

export function updateScore(data, selection, value) {
  const { sessionId, roundId, playerId } = selection;
  return updateSession(data, sessionId, (session) => ({
    ...session,
    rounds: session.rounds.map((round) =>
      round.id === roundId
        ? { ...round, scores: { ...round.scores, [playerId]: value === "" ? "" : Number(value) } }
        : round
    )
  }));
}

export function addRound(data, sessionId) {
  return updateSession(data, sessionId, (session) => ({
    ...session,
    rounds: [...session.rounds, createEmptyRound(session.participants, session.rounds.length + 1)]
  }));
}

export function removeRound(data, sessionId, roundId) {
  return updateSession(data, sessionId, (session) => {
    const rounds = session.rounds.filter((round) => round.id !== roundId);
    return { ...session, rounds: renumberRounds(rounds.length ? rounds : [createEmptyRound(session.participants, 1)]) };
  });
}

export function updateOutcome(data, sessionId, playerId, outcome) {
  return updateSession(data, sessionId, (session) => ({
    ...session,
    results: session.results.map((result) => (result.playerId === playerId ? { ...result, outcome } : result))
  }));
}

export function updateCollaborativeOutcome(data, sessionId, outcome) {
  return updateSession(data, sessionId, (session) => ({
    ...session,
    collaborativeOutcome: outcome
  }));
}

export function finishSession(data, sessionId) {
  return completeSession(data, sessionId, {});
}

export function finishSessionWithTiming(data, sessionId, timing = {}) {
  return completeSession(data, sessionId, timing);
}

function completeSession(data, sessionId, timing) {
  const current = data.sessions.find((session) => session.id === sessionId);
  if (current?.isCollaborative && !["win", "loss"].includes(current.collaborativeOutcome)) {
    return { data, errors: ["Choose a team result."] };
  }
  if (current?.scoringMode === "win_loss_tie" && current.results.some((result) => !result.outcome)) {
    return { data, errors: ["Choose a result for every player."] };
  }
  return updateSession(data, sessionId, (session) => {
    const winnerPlayerIds = getWinnerPlayerIds(session);
    const completedAt = normalizeTimestamp(timing.completedAt) || session.completedAt || new Date().toISOString();
    return {
      ...session,
      startedAt: normalizeTimestamp(timing.startedAt) || session.startedAt,
      status: "completed",
      completedAt,
      durationMinutesOverride: coerceDurationOverride(timing.durationMinutesOverride, session.durationMinutesOverride),
      winnerPlayerIds
    };
  });
}

export function deleteSession(data, sessionId) {
  return touchAndSave({ ...data, sessions: data.sessions.filter((session) => session.id !== sessionId) });
}

export function reopenSession(data, sessionId) {
  if (data.sessions.some((session) => session.status === "active" && session.id !== sessionId)) {
    return { data, errors: ["Finish the active session first."] };
  }
  return updateSession(data, sessionId, (session) => ({
    ...session,
    status: "active",
    winnerPlayerIds: []
  }));
}

export function updateSessionTiming(data, sessionId, timing = {}) {
  return updateSession(data, sessionId, (session) => ({
    ...session,
    startedAt: normalizeTimestamp(timing.startedAt) || session.startedAt,
    completedAt: normalizeTimestamp(timing.completedAt),
    durationMinutesOverride: coerceDurationOverride(timing.durationMinutesOverride, session.durationMinutesOverride)
  }));
}

export function getActiveSession(data) {
  return data.sessions.find((session) => session.status === "active") || null;
}

export function getTotals(session) {
  const totals = Object.fromEntries(session.participants.map((participant) => [participant.playerId, 0]));
  session.rounds.forEach((round) => {
    Object.entries(round.scores || {}).forEach(([playerId, score]) => {
      totals[playerId] = (totals[playerId] || 0) + (Number(score) || 0);
    });
  });
  return totals;
}

export function higherScoreLeads(session) {
  return session.scoringMode === "first_to_points" ? true : Boolean(session.higherScoreWins);
}

export function getWinnerPlayerIds(session) {
  if (session.isCollaborative) return [];
  if (session.scoringMode === "win_loss_tie") {
    return session.results.filter((result) => result.outcome === "win" || result.outcome === "tie").map((result) => result.playerId);
  }
  const totals = getTotals(session);
  const values = session.participants.map((participant) => totals[participant.playerId] || 0);
  const best = higherScoreLeads(session) ? Math.max(...values) : Math.min(...values);
  return session.participants.filter((participant) => (totals[participant.playerId] || 0) === best).map((participant) => participant.playerId);
}

export function getDurationMinutes(session) {
  const override = normalizeDurationOverride(session?.durationMinutesOverride);
  if (override !== null) return override;
  const startedAt = sessionDate(session, "startedAt");
  const completedAt = sessionDate(session, "completedAt");
  if (Number.isNaN(startedAt.getTime()) || Number.isNaN(completedAt.getTime())) return null;
  const minutes = Math.round((completedAt.getTime() - startedAt.getTime()) / 60000);
  return Number.isInteger(minutes) && minutes >= 0 ? minutes : null;
}

function updateSession(data, sessionId, updater) {
  const sessions = data.sessions.map((session) =>
    session.id === sessionId ? { ...updater(session), updatedAt: new Date().toISOString() } : session
  );
  const current = sessions.find((session) => session.id === sessionId);
  const errors = validateSession(current, { ...data, sessions });
  if (errors.length) return { data, errors };
  return touchAndSave({ ...data, sessions });
}

function createEmptyRound(players, roundNumber) {
  return {
    id: createId("round"),
    roundNumber,
    scores: Object.fromEntries(players.map((player) => [player.playerId || player.id, 0]))
  };
}

function renumberRounds(rounds) {
  return rounds.map((round, index) => ({ ...round, roundNumber: index + 1 }));
}

function touchAndSave(data) {
  return { data: saveData({ ...data, metadata: { ...data.metadata, updatedAt: new Date().toISOString() } }), errors: [] };
}

function normalizeTimestamp(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function normalizeDurationOverride(value) {
  if (value === "" || value === null || value === undefined) return null;
  const minutes = Number(value);
  return Number.isInteger(minutes) && minutes >= 0 ? minutes : null;
}

function coerceDurationOverride(value, fallback = null) {
  if (value === undefined) return fallback;
  if (value === "" || value === null) return null;
  return Number(value);
}

function sessionOption(game, input, field, mode) { return !game.isCollaborative && game.scoringMode === mode ? Number(input[field] || game[field]) : null; }
function initialRounds(game, players) { return game.isCollaborative || game.scoringMode === 'win_loss_tie' ? [] : [createEmptyRound(players, 1)]; }
function initialResults(game, players) { return !game.isCollaborative && game.scoringMode === 'win_loss_tie' ? players.map(player => ({ playerId: player.id, outcome: '' })) : []; }
function sessionDate(session, field) { return new Date(session?.[field] || ''); }
