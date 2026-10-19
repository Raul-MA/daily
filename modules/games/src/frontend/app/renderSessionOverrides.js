import { copy } from './copy.js';
import { escapeHtml } from '../components/components.js';

export function renderSessionOverrides(game) {
  if (!game) return "";
  if (game.isCollaborative) {
    return `<p class="subtle">${copy("This game records one shared Win or Loss for the whole table.")}</p>`;
  }
  if (game.scoringMode === "highest_score_after_rounds") {
    return `
      <label>
        ${copy("Rounds today")}
        <input name="roundCount" type="number" min="1" step="1" value="${escapeHtml(game.roundCount || 5)}">
      </label>
    `;
  }
  if (game.scoringMode === "first_to_points") {
    return `
      <label>
        ${copy("Target today")}
        <input name="targetScore" type="number" min="1" step="1" value="${escapeHtml(game.targetScore || 100)}">
      </label>
    `;
  }
  return `<p class="subtle">${copy("This game records Win, Loss, or Tie for each player.")}</p>`;
}
