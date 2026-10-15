import { filterHistory } from './filterHistory.js';
import { getHistoryFilterSummary } from './getHistoryFilterSummary.js';
import { testIds } from './testIds.js';
import { gameUI } from './context.js';
import { escapeHtml } from '../components/components.js';
import { renderHistoryFilters } from './renderHistoryFilters.js';
import { renderHistoryItem } from './renderHistoryItem.js';
import { t } from '../../backend/core/i18n.js';

export function renderHistory(data) {
  const sessions = filterHistory(data);
  const historySummary = getHistoryFilterSummary(data);
  return `
    <section class="view-header">
      <p>History</p>
      <h1>Completed games</h1>
    </section>
    <section class="filter-panel">
      <div class="filter-heading">
        <button type="button" data-testid="${testIds.historyFilterToggle}" aria-expanded="${gameUI.ui.historyFiltersOpen ? "true" : "false"}">
          ${gameUI.ui.historyFiltersOpen ? "Hide filters" : "Show filters"}
        </button>
        <div class="filter-summary" data-testid="${testIds.historyFilterSummary}">
          ${historySummary.length ? historySummary.map((item) => `<span>${escapeHtml(item)}</span>`).join("") : "<span>No filters</span>"}
        </div>
      </div>
      ${
        renderHistoryFilters(data)
      }
    </section>
    <section class="list history-list">
      ${
        sessions.length
          ? sessions.map((session) => renderHistoryItem(data, session)).join("")
          : `<p class="empty">${escapeHtml(t(data.settings.language, "emptyHistory"))}</p>`
      }
    </section>
  `;
}
