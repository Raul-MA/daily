import { escapeHtml } from '../components/components.js';

export function renderPlayerGameAverages(stat) {
  if (!stat.gameAverages.length) return `<p class="subtle">No score averages yet.</p>`;
  return `
    <dl class="stat-facts">
      ${stat.gameAverages
        .map(
          (game) => `
            <div>
              <dt>${escapeHtml(game.name)}</dt>
              <dd>${game.averageScore}</dd>
            </div>
          `
        )
        .join("")}
    </dl>
  `;
}
