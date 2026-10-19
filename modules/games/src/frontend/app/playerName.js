

export function playerName(data, playerId) {
  return data.players.find((player) => player.id === playerId)?.name || "";
}
