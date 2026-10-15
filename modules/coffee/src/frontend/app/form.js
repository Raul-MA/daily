import { entryValue } from './values.js';
import { checkEntry } from './conflicts.js';
import { getBeanPresets } from '../../backend/features/beans.js';
import { getSettings } from '../../backend/features/settings.js';
import { getExportReminder } from './settings.js';
import { tasteOptions, tr, currentLanguage } from './copy.js';
import { coffee } from './context.js';
import { testIds } from './testIds.js';
import { escapeHtml, iconButton, icons } from '../components/components.js';
import { pageHeader } from './format.js';
import { formMeta } from './formMeta.js';
import { formGrind } from './formGrind.js';
import { formPrep } from './formPrep.js';
import { formBrew } from './formBrew.js';
import { formVisual } from './formVisual.js';
import { formTaste } from './formTaste.js';
import { tasteHelpModal, openTasteHelp, closeTasteHelp } from './taste.js';
import { updateRatioPreview, updateCompositionFields } from './composition.js';
import { readEntryForm } from './input.js';
import { updateEntry, createEntry } from '../../backend/features/entries.js';
import { showToastKey, showToast } from './notifications.js';
import { setRoute, goToExportSettings } from './navigation.js';
import { translateMessage } from '../../backend/core/i18n.js';

export function renderEntryForm(entry = null) {
  const beans = getBeanPresets();
  const settings = getSettings();
  const exportReminder = getExportReminder(settings.lastExportedAt);
  const drinkType = entryValue(entry, "brew", "drinkType", "espresso");
  const options = tasteOptions();
  coffee.app.innerHTML = `
    ${!entry && exportReminder ? `<button class="backup-reminder backup-banner" type="button" id="new-export-reminder" data-testid="${testIds.newExportReminder}">${escapeHtml(exportReminder)}</button>` : ""}
    ${pageHeader(entry ? tr("pageEditTitle") : tr("pageNewTitle"), tr("pageNewSubtitle"))}
    <form id="entry-form" class="specimen-form" data-testid="${testIds.entryForm}">
      ${formMeta(entry, beans, drinkType)}
      ${formGrind(entry)}
      ${formPrep(entry, settings)}
      ${formBrew(entry)}
      ${formVisual(entry)}
      ${formTaste(entry, options)}
      <div class="action-row">
        ${entry ? `<button class="secondary" type="button" id="cancel-edit" data-testid="${testIds.cancelEdit}">${escapeHtml(tr("buttonCancel"))}</button>` : ""}
        <button class="primary" type="submit" data-testid="${testIds.saveShot}">${escapeHtml(entry ? tr("buttonSaveChanges") : tr("buttonSaveDrink"))}</button>
      </div>
    </form>
    ${tasteHelpModal()}
  `;
  wireEntryForm(entry);
}

export function beanPicker(beans, selectedId) {
  const selected = beans.find((bean) => bean.id === selectedId);
  const selectedLabel = selected ? beanLabel(selected) : "";
  return `
    <div class="bean-picker">
      <input id="beanSearch" type="text" list="bean-options" value="${escapeHtml(selectedLabel)}" autocomplete="off">
      <input id="beanPresetId" name="beanPresetId" type="hidden" value="${escapeHtml(selected?.id || "")}">
      <datalist id="bean-options">
        ${beans.map((bean) => `<option value="${escapeHtml(beanLabel(bean))}"></option>`).join("")}
      </datalist>
      ${iconButton(tr("ariaClearBean"), icons.close, `id="clear-bean" data-testid="${testIds.clearBean}"`)}
      <button class="secondary" type="button" id="manage-beans" data-testid="${testIds.manageBeans}">${escapeHtml(tr("buttonManage"))}</button>
    </div>
  `;
}

export function beanLabel(bean) {
  return `${bean.brand} / ${bean.blend}${bean.decaf ? ` / ${tr("fallbackDecaf")}` : ""}`;
}

export function syncBeanPicker(event) {
  const exact = getBeanPresets().find((bean) => beanLabel(bean) === event.target.value);
  coffee.host.querySelector("#beanPresetId").value = exact?.id || "";
}

export function clearBeanPicker() {
  coffee.host.querySelector("#beanSearch").value = "";
  coffee.host.querySelector("#beanPresetId").value = "";
  coffee.host.querySelector("#beanSearch").focus();
}

export function wireEntryForm(entry) {

  const form = coffee.host.querySelector("#entry-form");
  form.dataset.expectedEntry = JSON.stringify(entry);
  form.addEventListener("input", updateRatioPreview);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    try {
      checkEntry(form, entry);
      const payload = readEntryForm(form);
      const saved = entry ? updateEntry(entry.id, payload) : createEntry(payload);
      showToastKey(entry ? "toastDrinkUpdated" : "toastDrinkSaved");
      setRoute("detail", saved.id);
    } catch (error) {
      showToast(translateMessage(currentLanguage(), error.message));
    }
  });

  listen("#cancel-edit", "click", () => setRoute("detail", entry.id));
  listen("#new-export-reminder", "click", goToExportSettings);
  listen("#beanSearch", "change", syncBeanPicker);
  listen("#clear-bean", "click", clearBeanPicker);
  listen("#manage-beans", "click", () => setRoute("settings"));
  listen("#drinkType", "change", updateCompositionFields);
  coffee.host.querySelectorAll("[data-taste-help]").forEach((button) => {
    button.addEventListener("click", () => openTasteHelp(button.dataset.tasteHelp, button));
  });
  listen("#taste-help-close", "click", closeTasteHelp);
  listen("[data-close-taste-help]", "click", closeTasteHelp);
  listen("#overallScore", "input", (event) => {
    coffee.host.querySelector("[data-score-value]").value = event.target.value;
    event.target.parentElement.querySelector("output").textContent = event.target.value;
  });
  listen("[data-skip-score]", "click", () => {
    coffee.host.querySelector("[data-score-value]").value = "";
    coffee.host.querySelector(".slider-pair output").textContent = tr("buttonSkip");
  });
  updateCompositionFields();
  updateRatioPreview();
}

function listen(selector, event, handler) { coffee.host.querySelector(selector)?.addEventListener(event, handler); }
