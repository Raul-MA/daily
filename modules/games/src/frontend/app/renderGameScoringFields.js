import { scoringValue } from './values.js';
import { testIds } from './testIds.js';
import { escapeHtml } from '../components/components.js';

export function renderGameScoringFields(game, settings, mode, draft = {}) {
  if (mode === "highest_score_after_rounds") {
    return `
      <label>
        Rounds
        <input data-testid="${testIds.gameRoundCount}" name="roundCount" type="number" min="1" step="1" value="${escapeHtml(scoringValue(draft, game, "roundCount", settings.defaultRoundCount))}">
      </label>
    `;
  }
  if (mode === "first_to_points") {
    return `
      <label>
        Target score
        <input data-testid="${testIds.gameTargetScore}" name="targetScore" type="number" min="1" step="1" value="${escapeHtml(scoringValue(draft, game, "targetScore", settings.defaultTargetScore))}">
      </label>
    `;
  }
  return "";
}
