import { copy } from './copy.js';
import { escapeHtml, option } from '../components/components.js';
import { testIds } from './testIds.js';
import { t } from '../../backend/core/i18n.js';
import { renderSessionOverrides } from './renderSessionOverrides.js';
import { gameUI } from './context.js';

export function renderPlaySetup({ data, active, games, players, selectedGame }) {
 return active
        ? `<section class="ledger-block resume-block">
            <div>
              <strong>${escapeHtml(active.gameNameSnapshot)}</strong>
              <span>${copy("{count} players", { count: active.participants.length })}</span>
            </div>
            <button type="button" data-action="resume" data-testid="${testIds.navSession}">${escapeHtml(t(data.settings.language, "resume"))}</button>
          </section>`
        : `
          <section class="ledger-block">
            <label>
              ${copy("Game")}
              <select data-testid="${testIds.playGameSelect}">
                ${games.map((game) => option(game.id, game.name, selectedGame?.id)).join("")}
              </select>
            </label>
            ${renderSessionOverrides(selectedGame)}
            <div class="field-group">
              <span class="field-label">${copy("Players")}</span>
              <div class="toggle-list">
                ${
                  players.length
                    ? players
                        .map(
                          (player) => `
                            <label class="check-row">
                              <input data-testid="${testIds.playPlayerToggle}" type="checkbox" value="${escapeHtml(player.id)}" ${gameUI.ui.selectedPlayers.has(player.id) ? "checked" : ""}>
                              <span>${escapeHtml(player.name)}</span>
                            </label>
                          `
                        )
                        .join("")
                    : `<p class="empty">${copy("Add players before starting.")}</p>`
                }
              </div>
            </div>
            <div class="inline-form">
              <input data-testid="${testIds.inlinePlayerName}" placeholder="${copy("New player name")}">
              <button type="button" data-testid="${testIds.inlinePlayerAdd}">${copy("Add")}</button>
            </div>
            <button class="primary wide" type="button" data-testid="${testIds.playStart}">${escapeHtml(t(data.settings.language, "startGame"))}</button>
          </section>
        `;
}
