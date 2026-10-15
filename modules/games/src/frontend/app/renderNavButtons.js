import { testIds } from './testIds.js';
import { iconFor } from './iconFor.js';
import { escapeHtml } from '../components/components.js';

export function renderNavButtons(route, hasActive, compact) {
  const items = [
    ["play", testIds.navPlay, "Play"],
    ["session", testIds.navSession, hasActive ? "Session" : "Session"],
    ["history", testIds.navHistory, "History"],
    ["games", testIds.navGames, "Games"],
    ["players", testIds.navPlayers, "Players"],
    ["stats", testIds.navStats, "Stats"],
    ["settings", testIds.navSettings, "Settings"]
  ];
  return items
    .map(
      ([id, testId, label]) => `
        <button data-testid="${testId}" data-route="${id}" class="${route === id ? "active" : ""} ${compact ? "compact" : ""}">
          <span aria-hidden="true">${iconFor(id)}</span>
          <span>${escapeHtml(label)}</span>
        </button>
      `
    )
    .join("");
}
