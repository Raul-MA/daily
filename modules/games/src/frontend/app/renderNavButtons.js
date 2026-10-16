import { copy } from './copy.js';
import { testIds } from './testIds.js';
import { iconFor } from './iconFor.js';
import { escapeHtml } from '../components/components.js';

export function renderNavButtons(route, hasActive, compact) {
  const items = [
    ["play", testIds.navPlay, copy("Play")],
    ["session", testIds.navSession, hasActive ? copy("Session") : copy("Session")],
    ["history", testIds.navHistory, copy("History")],
    ["games", testIds.navGames, copy("Games")],
    ["players", testIds.navPlayers, copy("Players")],
    ["stats", testIds.navStats, copy("Stats")],
    ["settings", testIds.navSettings, copy("Settings")]
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
