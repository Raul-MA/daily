import { gameUI } from './context.js';
import { playerDisplayName } from './playerDisplayName.js';

export function sortHistory(data, a, b) {
  if (gameUI.ui.history.sort === "oldest") return new Date(a.completedAt) - new Date(b.completedAt);
  if (gameUI.ui.history.sort === "game") return a.gameNameSnapshot.localeCompare(b.gameNameSnapshot);
  if (gameUI.ui.history.sort === "winner") {
    const aWinner = a.winnerPlayerIds.map((id) => playerDisplayName(data, a, id)).join(", ");
    const bWinner = b.winnerPlayerIds.map((id) => playerDisplayName(data, b, id)).join(", ");
    return aWinner.localeCompare(bWinner);
  }
  return new Date(b.completedAt) - new Date(a.completedAt);
}
