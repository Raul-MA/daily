import { copy } from './copy.js';
import { testIds } from './testIds.js';
import { option, escapeHtml } from '../components/components.js';
import { statSummary } from './statSummary.js';
import { playerName } from './playerName.js';

export function renderHeadToHead(data, playerA, playerB, h2h) {
  return `
    <section class="ledger-block" data-testid="${testIds.headToHeadSection}">
      <div class="section-heading">
        <span>${copy("Matchup")}</span>
        <h2>${copy("Head to head")}</h2>
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
          <span>${copy("Shared games")}</span>
          <strong>${statSummary(h2h, 'played')}</strong>
        </div>
        <div class="metric">
          <span>${copy("{player} wins", { player: escapeHtml(playerName(data, playerA) || copy("Player A")) })}</span>
          <strong>${statSummary(h2h, 'playerAWins')}</strong>
        </div>
        <div class="metric">
          <span>${copy("{player} wins", { player: escapeHtml(playerName(data, playerB) || copy("Player B")) })}</span>
          <strong>${statSummary(h2h, 'playerBWins')}</strong>
        </div>
        <div class="metric">
          <span>${copy("Ties")}</span>
          <strong>${statSummary(h2h, 'ties')}</strong>
        </div>
      </div>
    </section>
`;
}
