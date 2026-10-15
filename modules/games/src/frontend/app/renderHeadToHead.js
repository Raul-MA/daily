import { testIds } from './testIds.js';
import { option, escapeHtml } from '../components/components.js';
import { statSummary } from './statSummary.js';
import { playerName } from './playerName.js';

export function renderHeadToHead(data, playerA, playerB, h2h) {
  return `
    <section class="ledger-block" data-testid="${testIds.headToHeadSection}">
      <div class="section-heading">
        <span>Matchup</span>
        <h2>Head to head</h2>
      </div>
      <div class="split">
        <select data-testid="${testIds.headToHeadA}">
          ${data.players.map((player) => option(player.id, player.name, playerA)).join("")}
        </select>
        <select data-testid="${testIds.headToHeadB}">
          ${data.players.map((player) => option(player.id, player.name, playerB)).join("")}
        </select>
      </div>
      <div class="metric-grid compact">
        <div class="metric">
          <span>Shared games</span>
          <strong>${statSummary(h2h, 'played')}</strong>
        </div>
        <div class="metric">
          <span>${escapeHtml(playerName(data, playerA) || "Player A")} wins</span>
          <strong>${statSummary(h2h, 'playerAWins')}</strong>
        </div>
        <div class="metric">
          <span>${escapeHtml(playerName(data, playerB) || "Player B")} wins</span>
          <strong>${statSummary(h2h, 'playerBWins')}</strong>
        </div>
        <div class="metric">
          <span>Ties</span>
          <strong>${statSummary(h2h, 'ties')}</strong>
        </div>
      </div>
    </section>
`;
}
