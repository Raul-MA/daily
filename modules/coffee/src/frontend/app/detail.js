import { getEntry, deleteEntry } from '../../backend/features/entries.js';
import { coffee } from './context.js';
import { emptyState, pageHeader } from './format.js';
import { tr } from './copy.js';
import { getBeanPreset } from '../../backend/features/beans.js';
import { testIds } from './testIds.js';
import { escapeHtml } from '../components/components.js';
import { detailMeta } from './detailMeta.js';
import { detailGrind } from './detailGrind.js';
import { detailPrep } from './detailPrep.js';
import { detailBrew } from './detailBrew.js';
import { detailVisual } from './detailVisual.js';
import { detailTaste } from './detailTaste.js';
import { setRoute } from './navigation.js';
import { showToastKey } from './notifications.js';

export function renderEntryDetail(id) {
  const entry = getEntry(id);
  if (!entry) {
    coffee.app.innerHTML = pageHeader(tr('pageDetailTitle'), '') + emptyState(tr("emptyDrinkNotFound"), tr("emptyDrinkDeleted"));
    return;
  }
  const bean = getBeanPreset(entry.meta.beanPresetId);
  coffee.app.innerHTML = `
    ${pageHeader(tr("pageDetailTitle"), bean ? `${bean.brand} / ${bean.blend}` : tr("fallbackMissingBean"))}
    <article class="detail-sheet" data-testid="${testIds.entryDetail}">
      <div class="hero-number"><span>${escapeHtml(tr("labelScore"))}</span><strong>${entry.taste.overallScore ?? "-"}</strong></div>
      ${detailMeta(entry, bean)}
      ${detailGrind(entry)}
      ${detailPrep(entry)}
      ${detailBrew(entry)}
      ${detailVisual(entry)}
      ${detailTaste(entry)}
      <div class="action-row">
        <button class="secondary" type="button" id="back-history" data-testid="${testIds.backHistory}">${escapeHtml(tr("buttonHistory"))}</button>
        <button class="secondary" type="button" id="edit-entry" data-testid="${testIds.editEntry}">${escapeHtml(tr("buttonEdit"))}</button>
        <button class="danger" type="button" id="delete-entry" data-testid="${testIds.deleteEntry}">${escapeHtml(tr("buttonDelete"))}</button>
      </div>
    </article>
  `;
  coffee.host.querySelector("#back-history").addEventListener("click", () => setRoute("history"));
  coffee.host.querySelector("#edit-entry").addEventListener("click", () => setRoute("edit", entry.id));
  coffee.host.querySelector("#delete-entry").addEventListener("click", () => {
    if (!confirm(tr("confirmDeleteDrink"))) return;
    deleteEntry(entry.id);
    showToastKey("toastDrinkDeleted");
    setRoute("history");
  });
}
