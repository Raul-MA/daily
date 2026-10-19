import { copy } from './copy.js';
import { escapeHtml } from '../components/components.js';
import { formatDuration } from './formatDuration.js';

export function renderDurationByPlayerCount(stat) {
  if (!stat.durationByPlayerCount.length) return `<p class="subtle">${copy("No duration averages yet.")}</p>`;
  return `
    <dl class="stat-facts duration-breakdown">
      ${stat.durationByPlayerCount
        .map(
          (group) => `
            <div>
              <dt>${copy(group.playerCount === 1 ? "{count} player" : "{count} players", { count: group.playerCount })}</dt>
              <dd>${escapeHtml(formatDuration(group.averageDurationMinutes))}</dd>
            </div>
          `
        )
        .join("")}
    </dl>
  `;
}
