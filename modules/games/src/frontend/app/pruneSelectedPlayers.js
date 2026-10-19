import { gameUI } from './context.js';

export function pruneSelectedPlayers(players) {
  const activeIds = new Set(players.map((player) => player.id));
  gameUI.ui.selectedPlayers = new Set([...gameUI.ui.selectedPlayers].filter((id) => activeIds.has(id)));
}
