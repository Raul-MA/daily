import { renderHeadToHead } from './renderHeadToHead.js';
import { buildStats } from '../../backend/features/stats.js';
import { selectedStatPlayer } from './selectedStatPlayer.js';
import { gameUI } from './context.js';
import { headToHead } from './headToHead.js';
import { testIds } from './testIds.js';
import { renderPlayerRecords } from './renderPlayerRecords.js';
import { renderGameRecords } from './renderGameRecords.js';

export function renderStats(data) {
  const stats = buildStats(data);
  const playerA = selectedStatPlayer(data, gameUI.ui.headToHeadA);
  const playerB = selectedStatPlayer(data, gameUI.ui.headToHeadB, playerA);
  const h2h = headToHead(data, playerA, playerB);
  return `
    <section class="view-header">
      <p>Stats</p>
      <h1>Records</h1>
    </section>
    ${renderHeadToHead(data, playerA, playerB, h2h)}
    <section class="records-section">
      <div class="section-heading">
        <span>Players</span>
        <h2>Table records</h2>
      </div>
    <section class="stats-grid" data-testid="${testIds.statsView}">
      ${renderPlayerRecords(stats)}
    </section>
    </section>
    <section class="ledger-block">
      <div class="section-heading">
        <span>Games</span>
        <h2>Game records</h2>
      </div>
      <div class="stats-grid" data-testid="${testIds.gameStatsView}">
        ${renderGameRecords(data, stats)}
      </div>
    </section>
  `;
}
