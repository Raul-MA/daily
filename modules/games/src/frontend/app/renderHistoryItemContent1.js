import { escapeHtml } from '../components/components.js';
import { playerDisplayName } from './playerDisplayName.js';

export function renderHistoryItemContent1(data, session, totals) {
 return !session.isCollaborative && session.scoringMode !== "win_loss_tie"
            ? `<dl class="score-list">${session.participants
                .map(
                  (p) => `
                    <div>
                      <dt>${escapeHtml(playerDisplayName(data, session, p.playerId))}</dt>
                      <dd>${totals[p.playerId] || 0}</dd>
                    </div>
                  `
                )
                .join("")}</dl>`
            : "";
}
