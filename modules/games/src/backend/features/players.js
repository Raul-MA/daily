import { createId } from "../core/id.js";
import { saveData } from "../core/storage.js";
import { validatePlayer } from "../core/validation.js";

export function createPlayer(data, input) {
  const now = new Date().toISOString();
  const player = normalizePlayer({
    id: createId("player"),
    name: input.name,
    archived: false,
    createdAt: now,
    updatedAt: now
  });
  const errors = validatePlayer(player, data.players);
  if (errors.length) return { data, errors };
  return touchAndSave({ ...data, players: sortPlayers([...data.players, player]) });
}

export function updatePlayer(data, id, input) {
  const players = data.players.map((player) =>
    player.id === id ? normalizePlayer({ ...player, ...input, updatedAt: new Date().toISOString() }) : player
  );
  const current = players.find((player) => player.id === id);
  const errors = validatePlayer(current, players);
  if (errors.length) return { data, errors };
  return touchAndSave({ ...data, players: sortPlayers(players) });
}

export function archivePlayer(data, id) {
  return updatePlayer(data, id, { archived: true });
}

export function removePlayer(data, id) {
  if (hasPlayerHistory(data, id)) return archivePlayer(data, id);
  return touchAndSave({ ...data, players: data.players.filter((player) => player.id !== id) });
}

export function hasPlayerHistory(data, id) {
  return data.sessions.some((session) => session.participants.some((participant) => participant.playerId === id));
}

export function getPlayerName(data, id, fallback = "Unknown player") {
  return data.players.find((player) => player.id === id)?.name || fallback;
}

export function normalizePlayer(player) {
  return {
    id: String(player.id),
    name: String(player.name || "").trim(),
    archived: Boolean(player.archived),
    createdAt: player.createdAt || new Date().toISOString(),
    updatedAt: player.updatedAt || new Date().toISOString()
  };
}

function sortPlayers(players) {
  return [...players].sort((a, b) => a.name.localeCompare(b.name));
}

function touchAndSave(data) {
  return { data: saveData({ ...data, metadata: { ...data.metadata, updatedAt: new Date().toISOString() } }), errors: [] };
}
