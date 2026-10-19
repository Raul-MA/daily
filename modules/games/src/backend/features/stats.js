import { getDurationMinutes, getTotals } from "./sessions.js";

export function buildStats(data) {
 const completed = data.sessions.filter(session => session.status === 'completed');
 const playerStats = data.players.map(createPlayerStats);
 const gameStats = data.games.map(createGameStats);
 const byPlayer = Object.fromEntries(playerStats.map(stat => [stat.playerId, stat]));
 const byGame = Object.fromEntries(gameStats.map(stat => [stat.gameId, stat]));
 for (const session of completed) {
  const game = byGame[session.gameId];
  if (game) addGameResult(game, session);
  for (const participant of session.participants) {
   const stat = byPlayer[participant.playerId];
   if (stat) addPlayerResult(stat, session, game, participant.playerId);
  }
 }
 playerStats.forEach(finishPlayerStats);
 gameStats.forEach(finishGameStats);
 return { players: playerStats, games: gameStats };
}


export function buildHeadToHead(data, playerA, playerB) {
  const sessions = data.sessions.filter(
    (session) =>
      session.status === "completed" &&
      !session.isCollaborative &&
      session.participants.some((participant) => participant.playerId === playerA) &&
      session.participants.some((participant) => participant.playerId === playerB)
  );
  const summary = { played: sessions.length, playerAWins: 0, playerBWins: 0, ties: 0 };
  sessions.forEach((session) => {
    const aWon = session.winnerPlayerIds.includes(playerA);
    const bWon = session.winnerPlayerIds.includes(playerB);
    if (aWon && bWon) summary.ties += 1;
    else if (aWon) summary.playerAWins += 1;
    else if (bWon) summary.playerBWins += 1;
  });
  return { summary, sessions };
}

function createPlayerStats(player) {
  return {
    playerId: player.id,
    name: player.name,
    played: 0,
    wins: 0,
    losses: 0,
    ties: 0,
    winRate: 0,
    collaborativePlayed: 0,
    collaborativeWins: 0,
    collaborativeLosses: 0,
    collaborativeWinRate: 0,
    totalPoints: 0,
    gameScores: {},
    gameAverages: [],
    bestScore: null,
    worstScore: null
  };
}

function resultFor(session, playerId) {
  return session.results.find((result) => result.playerId === playerId)?.outcome;
}

function maxDate(current, next) {
  if (!current) return next;
  return new Date(next) > new Date(current) ? next : current;
}

function addGameDuration(game, session) {
  const minutes = getDurationMinutes(session);
  if (minutes === null) return;
  game.totalDurationMinutes += minutes;
  game.durationCount += 1;
  game.shortestDurationMinutes = game.shortestDurationMinutes === null ? minutes : Math.min(game.shortestDurationMinutes, minutes);
  game.longestDurationMinutes = game.longestDurationMinutes === null ? minutes : Math.max(game.longestDurationMinutes, minutes);
  if (!game.lastPlayed || new Date(session.completedAt) >= new Date(game.lastPlayed)) game.lastDurationMinutes = minutes;

  const playerCount = session.participants.length;
  const group = game.durationByPlayerCount[playerCount] || { playerCount, plays: 0, totalDurationMinutes: 0 };
  group.plays += 1;
  group.totalDurationMinutes += minutes;
  game.durationByPlayerCount[playerCount] = group;
}

function createGameStats(game) { return {
    gameId: game.id,
    name: game.name,
    plays: 0,
    competitivePlays: 0,
    collaborativePlays: 0,
    collaborativeWins: 0,
    collaborativeLosses: 0,
    lastPlayed: null,
    winnerCounts: {},
    totalDurationMinutes: 0,
    durationCount: 0,
    averageDurationMinutes: null,
    lastDurationMinutes: null,
    shortestDurationMinutes: null,
    longestDurationMinutes: null,
    durationByPlayerCount: {}
  }; }

function addGameResult(game, session) {
 game.plays += 1;
 game.lastPlayed = maxDate(game.lastPlayed, session.completedAt);
 addGameDuration(game, session);
 if (session.isCollaborative) {
  game.collaborativePlays += 1;
  game.collaborativeWins += session.collaborativeOutcome === 'win' ? 1 : 0;
  game.collaborativeLosses += session.collaborativeOutcome === 'loss' ? 1 : 0;
 } else {
  game.competitivePlays += 1;
  for (const id of session.winnerPlayerIds) game.winnerCounts[id] = (game.winnerCounts[id] || 0) + 1;
 }
}
function addPlayerResult(stat, session, game, playerId) {
 if (session.isCollaborative) {
  stat.collaborativePlayed += 1;
  stat.collaborativeWins += session.collaborativeOutcome === 'win' ? 1 : 0;
  stat.collaborativeLosses += session.collaborativeOutcome === 'loss' ? 1 : 0;
  stat.collaborativeWinRate = Math.round((stat.collaborativeWins / stat.collaborativePlayed) * 100);
  return;
 }
 addCompetitiveResult(stat, session, game, playerId);
}
function addCompetitiveResult(stat, session, game, playerId) {
 const won = session.winnerPlayerIds.includes(playerId);
 const tied = session.winnerPlayerIds.length > 1 && won;
 stat.played += 1;
 stat.wins += won && !tied ? 1 : 0;
 stat.ties += tied || resultFor(session, playerId) === 'tie' ? 1 : 0;
 stat.losses = stat.played - stat.wins - stat.ties;
 if (session.scoringMode !== 'win_loss_tie') addPlayerScores(stat, session, game, playerId);
 stat.winRate = stat.played ? Math.round((stat.wins / stat.played) * 100) : 0;
}
function addPlayerScores(stat, session, game, playerId) {
 const total = getTotals(session)[playerId] || 0;
 const gameScore = stat.gameScores[session.gameId] || { gameId: session.gameId, name: game?.name || session.gameNameSnapshot, played: 0, totalPoints: 0, averageScore: 0 };
 gameScore.played += 1;
 gameScore.totalPoints += total;
 gameScore.averageScore = Math.round(gameScore.totalPoints / gameScore.played);
 stat.gameScores[session.gameId] = gameScore;
 stat.totalPoints += total;
 stat.bestScore = stat.bestScore === null ? total : Math.max(stat.bestScore, total);
 stat.worstScore = stat.worstScore === null ? total : Math.min(stat.worstScore, total);
}
function finishPlayerStats(stat) {
 stat.gameAverages = Object.values(stat.gameScores).sort((a, b) => a.name.localeCompare(b.name));
 delete stat.gameScores;
}
function finishGameStats(stat) {
 stat.averageDurationMinutes = stat.durationCount ? Math.round(stat.totalDurationMinutes / stat.durationCount) : null;
 stat.durationByPlayerCount = Object.values(stat.durationByPlayerCount).map(group => ({ playerCount: group.playerCount, plays: group.plays, averageDurationMinutes: Math.round(group.totalDurationMinutes / group.plays) })).sort((a, b) => a.playerCount - b.playerCount);
 delete stat.totalDurationMinutes;
 delete stat.durationCount;
}
