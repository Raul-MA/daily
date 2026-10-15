import { escapeHtml } from '../components/components.js';
import { formatDuration } from './formatDuration.js';

export function renderDurationByPlayerCount(stat) {
  if (!stat.durationByPlayerCount.length) return `<p class="subtle">No duration averages yet.</p>`;
  return `
    <dl class="stat-facts duration-breakdown">
      ${stat.durationByPlayerCount
        .map(
          (group) => `
            <div>
              <dt>${group.playerCount} ${group.playerCount === 1 ? "player" : "players"}</dt>
              <dd>${escapeHtml(formatDuration(group.averageDurationMinutes))}</dd>
            </div>
          `
        )
        .join("")}
    </dl>
  `;
}
