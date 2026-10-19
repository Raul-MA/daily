import { copy } from './copy.js';
import { escapeHtml } from '../components/components.js';
import { formatDate } from './formatDate.js';
import { formatDuration } from './formatDuration.js';
import { formatDurationRange } from './formatDurationRange.js';
import { renderDurationByPlayerCount } from './renderDurationByPlayerCount.js';

export function renderGameRecords(data, stats) {
 return stats.games
          .map((stat) => {
            const leader = Object.entries(stat.winnerCounts).sort((a, b) => b[1] - a[1])[0];
            const leaderName = leader ? data.players.find((player) => player.id === leader[0])?.name || copy("Unknown player") : "";
            return `
              <article class="stat-card">
                <div class="stat-card-header">
                  <span>${escapeHtml(stat.name)}</span>
                  <strong>${stat.plays}</strong>
                </div>
                <dl class="stat-facts">
                  <div>
                    <dt>${copy("Last played")}</dt>
                    <dd>${stat.lastPlayed ? formatDate(stat.lastPlayed) : copy("Not played yet")}</dd>
                  </div>
                  <div>
                    <dt>${copy("Most wins")}</dt>
                    <dd>${leaderName ? escapeHtml(leaderName) : copy("No winner yet")}</dd>
                  </div>
                  <div>
                    <dt>${copy("Collaborative record")}</dt>
                    <dd>${stat.collaborativeWins}-${stat.collaborativeLosses}</dd>
                  </div>
                  <div>
                    <dt>${copy("Average duration")}</dt>
                    <dd>${escapeHtml(formatDuration(stat.averageDurationMinutes))}</dd>
                  </div>
                  <div>
                    <dt>${copy("Last time")}</dt>
                    <dd>${escapeHtml(formatDuration(stat.lastDurationMinutes))}</dd>
                  </div>
                  <div>
                    <dt>${copy("Fastest / longest")}</dt>
                    <dd>${escapeHtml(formatDurationRange(stat.shortestDurationMinutes, stat.longestDurationMinutes))}</dd>
                  </div>
                </dl>
                ${renderDurationByPlayerCount(stat)}
              </article>
            `;
          })
          .join("");
}
