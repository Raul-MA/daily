import { copy } from './copy.js';
import { editorValue } from './values.js';
import { testIds } from './testIds.js';
import { escapeHtml, option } from '../components/components.js';
import { scoringLabels } from '../../backend/features/games.js';
import { renderGameScoringFields } from './renderGameScoringFields.js';

export function renderGameEditor({ data, current, active, draft, mode, isCollaborative }) {
 return active
        ? `<p class="notice">${copy("Finish the active session before adding or editing games.")}</p>`
        : `
          <section class="ledger-block">
            <form data-testid="${testIds.gameForm}">
              <label>
                ${copy("Name")}
                <input data-testid="${testIds.gameName}" name="name" value="${escapeHtml(editorValue(draft, current, "name"))}" required>
              </label>
              <label class="check-row collaborative-check">
                <input data-testid="${testIds.gameCollaborative}" name="isCollaborative" type="checkbox" ${isCollaborative ? "checked" : ""}>
                <span>
                  <strong>${copy("Collaborative game")}</strong>
                  <small>${copy("Record one shared Win or Loss for the whole table.")}</small>
                </span>
              </label>
              ${
                isCollaborative
                  ? ""
                  : `<label>
                      ${copy("Scoring")}
                      <select data-testid="${testIds.gameMode}" name="scoringMode">
                        ${Object.entries(scoringLabels).map(([value, label]) => option(value, copy(label), mode)).join("")}
                      </select>
                    </label>
                    ${renderGameScoringFields(current, data.settings, mode, draft)}`
              }
              <label>
                ${copy("Notes")}
                <textarea name="notes">${escapeHtml(editorValue(draft, current, "notes"))}</textarea>
              </label>
              <button class="primary" data-testid="${testIds.gameSave}" type="submit">${current ? copy("Save game") : copy("Add game")}</button>
            </form>
          </section>
        `;
}
