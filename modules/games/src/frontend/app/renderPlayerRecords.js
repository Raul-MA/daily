import { copy } from './copy.js';
import { escapeHtml } from '../components/components.js';
import { renderPlayerGameAverages } from './renderPlayerGameAverages.js';

export function renderPlayerRecords(stats) {
 return stats.players
        .map(
          (stat) => `
            <article class="stat-card">
              <div class="stat-card-header">
                <span>${escapeHtml(stat.name)}</span>
                <strong>${stat.wins}-${stat.losses}-${stat.ties}</strong>
              </div>
              <div class="metric-grid compact">
                <div class="metric">
                  <span>${copy("Played")}</span>
                  <strong>${stat.played}</strong>
                </div>
                <div class="metric">
                  <span>${copy("Win rate")}</span>
                  <strong>${stat.winRate}%</strong>
                </div>
              </div>
              <dl class="stat-facts collaborative-facts">
                <div>
                  <dt>${copy("Collaborative record")}</dt>
                  <dd>${stat.collaborativeWins}-${stat.collaborativeLosses}</dd>
                </div>
                <div>
                  <dt>${copy("Collaborative win rate")}</dt>
                  <dd>${stat.collaborativeWinRate}%</dd>
                </div>
              </dl>
              ${renderPlayerGameAverages(stat)}
            </article>
          `
        )
        .join("");
}
