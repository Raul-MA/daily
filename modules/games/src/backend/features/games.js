import { createId } from "../core/id.js";
import { saveData } from "../core/storage.js";
import { validateGame } from "../core/validation.js";

export const scoringLabels = {
  win_loss_tie: "Win / loss / tie",
  highest_score_after_rounds: "Highest score after rounds",
  first_to_points: "First to points"
};

export function createGame(data, input) {
  const now = new Date().toISOString();
  const game = normalizeGame({
    id: createId("game"),
    ...input,
    archived: false,
    createdAt: now,
    updatedAt: now
  });
  const errors = validateGame(game);
  if (errors.length) return { data, errors };
  return touchAndSave({ ...data, games: sortGames([...data.games, game]) });
}

export function updateGame(data, id, input) {
  const games = data.games.map((game) =>
    game.id === id ? normalizeGame({ ...game, ...input, updatedAt: new Date().toISOString() }) : game
  );
  const current = games.find((game) => game.id === id);
  const errors = validateGame(current);
  if (errors.length) return { data, errors };
  return touchAndSave({ ...data, games: sortGames(games) });
}

export function archiveGame(data, id) {
  return updateGame(data, id, { archived: true });
}

export function removeGame(data, id) {
  if (hasGameHistory(data, id)) return archiveGame(data, id);
  return touchAndSave({ ...data, games: data.games.filter((game) => game.id !== id) });
}

export function hasGameHistory(data, id) {
  return data.sessions.some((session) => session.gameId === id);
}

export function normalizeGame(game) {
  const scoringMode = game.scoringMode || "highest_score_after_rounds";
  return {
    id: String(game.id),
    name: String(game.name || "").trim(),
    isCollaborative: Boolean(game.isCollaborative),
    scoringMode,
    roundCount: optionalNumber(game.roundCount),
    targetScore: optionalNumber(game.targetScore),
    higherScoreWins: scoreDirection(game.higherScoreWins),
    minPlayers: game.minPlayers ? Number(game.minPlayers) : null,
    maxPlayers: game.maxPlayers ? Number(game.maxPlayers) : null,
    notes: String(game.notes || "").trim(),
    archived: Boolean(game.archived),
    createdAt: game.createdAt || new Date().toISOString(),
    updatedAt: game.updatedAt || new Date().toISOString()
  };
}

function sortGames(games) {
  return [...games].sort((a, b) => a.name.localeCompare(b.name));
}

function touchAndSave(data) {
  return { data: saveData({ ...data, metadata: { ...data.metadata, updatedAt: new Date().toISOString() } }), errors: [] };
}

function optionalNumber(value) { return value === "" || value == null ? null : Number(value); }
function scoreDirection(value) { return value === undefined ? true : Boolean(value); }
