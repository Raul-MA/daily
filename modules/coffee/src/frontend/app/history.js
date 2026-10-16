import { attempt } from './notifications.js';
import { getBeanPresets } from '../../backend/features/beans.js';
import { getSettings, updateSettings } from '../../backend/features/settings.js';
import { tr, drinkTypeOptions } from './copy.js';
import { coffee } from './context.js';
import { pageHeader, emptyState, formatDate, formatGramValue, formatRatio, formatValueWithUnit, formatSecondsValue } from './format.js';
import { testIds } from './testIds.js';
import { escapeHtml, selectInput, numberInput, textInput } from '../components/components.js';
import { sortEntries, filterEntries } from '../../backend/features/entries.js';
import { setRoute } from './navigation.js';
import { formatDrinkType } from './composition.js';

export function renderHistory() {
  const beans = getBeanPresets();
  const settings = getSettings();
  const beanOptions = [{ value: "", label: tr("optionAllBeans") }, ...beans.map((bean) => ({ value: bean.id, label: `${bean.brand} / ${bean.blend}` }))];
  const drinkOptions = [{ value: "", label: tr("optionAllDrinks") }, ...drinkTypeOptions()];
  coffee.app.innerHTML = `
    ${pageHeader(tr("pageHistoryTitle"), tr("pageHistorySubtitle"))}
    <div class="history-toolbar">
      <button class="secondary" type="button" id="toggle-filters" aria-expanded="${Boolean(coffee.ui.historyOpen)}" aria-controls="filters" data-testid="${testIds.toggleFilters}">${escapeHtml(tr("buttonFilters"))}</button>
      <span id="filter-status" data-testid="${testIds.filterStatus}">${escapeHtml(tr("optionNewest"))}</span>
      ${historyViewSwitch(settings.historyListView)}
    </div>
    <form id="filters" class="filter-strip" data-testid="${testIds.filters}" ${coffee.ui.historyOpen ? "" : "hidden"}>
      ${selectInput({ id: "filterBean", options: beanOptions })}
      ${selectInput({ id: "filterDrinkType", options: drinkOptions })}
      ${numberInput({ id: "scoreMin", min: "1", max: "10", step: "1", unit: tr("unitMinimum") })}
      ${textInput({ id: "startDate", type: "date" })}
      ${textInput({ id: "endDate", type: "date" })}
      ${selectInput({ id: "sortBy", value: "dateDesc", options: [
        { value: "dateDesc", label: tr("optionNewest") },
        { value: "dateAsc", label: tr("optionOldest") },
        { value: "scoreDesc", label: tr("optionBest") },
        { value: "scoreAsc", label: tr("optionWorst") }
      ] })}
    </form>
    <div id="entry-list" class="entry-list" data-testid="${testIds.entryList}"></div>
  `;

  const form = coffee.host.querySelector("#filters");
  const toggleButton = coffee.host.querySelector("#toggle-filters");
  toggleButton.addEventListener("click", () => {
    form.hidden = !form.hidden;
    coffee.ui.historyOpen = !form.hidden;
    toggleButton.setAttribute("aria-expanded", String(!form.hidden));
  });
  coffee.host.querySelectorAll("[data-history-view]").forEach((button) => {
    button.addEventListener("click", () => attempt(() => {
      updateSettings({ historyListView: button.dataset.historyView });
      renderHistory();
    }));
  });
  form.addEventListener("input", refreshHistory);
  refreshHistory();
}

export function historyViewSwitch(view) {
  const currentView = view === "detailed" ? "detailed" : "compact";
  return `
    <div class="view-switch" role="group" aria-label="${escapeHtml(tr("labelHistoryView"))}">
      <button class="${currentView === "compact" ? "active" : ""}" type="button" data-history-view="compact" aria-pressed="${currentView === "compact"}" data-testid="${testIds.historyViewCompact}">${escapeHtml(tr("buttonCompact"))}</button>
      <button class="${currentView === "detailed" ? "active" : ""}" type="button" data-history-view="detailed" aria-pressed="${currentView === "detailed"}" data-testid="${testIds.historyViewDetailed}">${escapeHtml(tr("buttonDetailed"))}</button>
    </div>
  `;
}

export function getHistoryFilterStatus(data) {
  const hasActiveFilter = Boolean(data.get("filterBean") || data.get("filterDrinkType") || data.get("scoreMin") || data.get("startDate") || data.get("endDate"));
  if (hasActiveFilter) return tr("optionFiltered");

  const labels = {
    dateDesc: tr("optionNewest"),
    dateAsc: tr("optionOldest"),
    scoreDesc: tr("optionBest"),
    scoreAsc: tr("optionWorst")
  };
  return labels[data.get("sortBy")] || tr("optionNewest");
}

export function drawEntryList(entries, view = "compact") {
  const beanMap = new Map(getBeanPresets().map((bean) => [bean.id, bean]));
  const list = coffee.host.querySelector("#entry-list");
  list.innerHTML = entries.length ? entries.map((entry) => {
    const bean = beanMap.get(entry.meta.beanPresetId);
    return view === "detailed" ? detailedEntryRow(entry, bean) : compactEntryRow(entry, bean);
  }).join("") : emptyState(tr("emptyNoDrinksMatch"), tr("emptyLoosenFilters"));

  list.querySelectorAll("[data-entry]").forEach((button) => button.addEventListener("click", () => setRoute("detail", button.dataset.entry)));
}

export function detailedEntryRow(entry, bean) {
  return `
    <button class="entry-row" type="button" data-entry="${escapeHtml(entry.id)}" data-testid="${testIds.entryRow}">
      <span>
        <em>${formatDate(entry.meta.brewedAt)}</em>
        <strong>${escapeHtml(bean ? `${bean.brand} / ${bean.blend}` : tr("fallbackMissingBean"))}</strong>
      </span>
      <span><em>${escapeHtml(tr("labelDrink"))}</em><strong>${escapeHtml(formatDrinkType(entry.brew.drinkType))}</strong></span>
      <span><em>${escapeHtml(tr("labelDose"))}</em><strong>${formatGramValue(entry.grind.doseG)}</strong></span>
      <span><em>DF54</em><strong>${escapeHtml(entry.grind.grindSetting ?? "-")}</strong></span>
      <span><em>${escapeHtml(tr("labelRatio"))}</em><strong>${formatRatio(entry.brew.ratio)}</strong></span>
      <span><em>${escapeHtml(tr("labelScore"))}</em><strong>${escapeHtml(entry.taste.overallScore ?? "-")}</strong></span>
    </button>
  `;
}

export function compactEntryRow(entry, bean) {
  return `
    <button class="entry-row compact-entry-row" type="button" data-entry="${escapeHtml(entry.id)}" data-testid="${testIds.entryRow}">
      <span class="compact-entry-main">
        <strong>${escapeHtml(bean ? `${bean.brand} / ${bean.blend}` : tr("fallbackMissingBean"))}</strong>
        <em>${formatDate(entry.meta.brewedAt)}</em>
      </span>
      <span class="compact-entry-metrics">
        ${compactMetric(tr("labelDrink"), formatDrinkType(entry.brew.drinkType))}
        ${compactMetric(tr("labelDose"), formatGramValue(entry.grind.doseG))}
        ${compactMetric("DF54", entry.grind.grindSetting ?? "-")}
        ${compactMetric(tr("labelYield"), formatValueWithUnit(entry.brew.yieldValue, entry.brew.yieldUnit))}
        ${compactMetric(tr("labelRatio"), formatRatio(entry.brew.ratio))}
        ${compactMetric(tr("labelTime"), formatSecondsValue(entry.brew.shotTimeSeconds))}
        ${compactMetric(tr("labelScore"), entry.taste.overallScore ?? "-")}
      </span>
    </button>
  `;
}

export function compactMetric(label, value) {
  return `<span><em>${escapeHtml(label)}</em><strong>${escapeHtml(value)}</strong></span>`;
}

export function refreshHistory() {
  const form = coffee.host.querySelector('#filters');
  if (!form) return;
  const data = new FormData(form);
  const entries = sortEntries(filterEntries({
    beanPresetId: data.get('filterBean'), drinkType: data.get('filterDrinkType'),
    scoreMin: data.get('scoreMin'), startDate: data.get('startDate'), endDate: data.get('endDate'),
  }), data.get('sortBy'));
  coffee.host.querySelector('#filter-status').textContent = getHistoryFilterStatus(data);
  drawEntryList(entries, getSettings().historyListView);
}
