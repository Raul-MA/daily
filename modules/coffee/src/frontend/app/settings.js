import { showImportPreview } from './import-preview.js';
import { checkBean, checkSettings, settingsStamp } from './conflicts.js';
import { captureDrafts, restoreDrafts } from '../../../../../packages/ui/src/drafts.js';
import { attempt } from './notifications.js';
import { getSettings, updateSettings } from '../../backend/features/settings.js';
import { coffee } from './context.js';
import { pageHeader } from './format.js';
import { tr } from './copy.js';
import { settingsBeans } from './settingsBeans.js';
import { settingsPreferences } from './settingsPreferences.js';
import { settingsBackup } from './settingsBackup.js';
import { EXPORT_REMINDER_DAYS } from './constants.js';
import { getBeanPresets, getBeanPreset, deleteBeanPreset, updateBeanPreset, createBeanPreset } from '../../backend/features/beans.js';
import { testIds } from './testIds.js';
import { escapeHtml } from '../components/components.js';
import { showToastKey, showToast, applyTheme, applyLanguage } from './notifications.js';
import { readToolSettings } from './tools.js';
import { renderTabs, render } from './navigation.js';
import { exportAll } from '../../backend/features/importExport.js';

export function renderSettings() {
  const settings = getSettings();
  const exportReminder = getExportReminder(settings.lastExportedAt);
  coffee.app.innerHTML = `
    ${pageHeader(tr("pageSettingsTitle"), tr("pageSettingsSubtitle"))}
    ${settingsBeans()}
    ${settingsPreferences(settings)}
    ${settingsBackup(exportReminder)}
  `;
  wireSettings();
  coffee.host.querySelector('#settings-form').dataset.expectedSettings = settingsStamp();
  renderBeanList();
}

export function wireSettings() {
coffee.host.querySelector("#settings-form").addEventListener("submit", savePreferences);
coffee.host.querySelector("#bean-form").addEventListener("submit", saveBean);
coffee.host.querySelector("#export-data").addEventListener("click", () => attempt(downloadBackup));
coffee.host.querySelector("#import-data").addEventListener("change", selectImport);
}

export function getExportReminder(lastExportedAt, now = new Date()) {
  if (!lastExportedAt) return tr("backupNever", { days: EXPORT_REMINDER_DAYS });

  const exportedAt = new Date(lastExportedAt);
  if (Number.isNaN(exportedAt.getTime())) return tr("backupInvalidDate");

  const daysSinceExport = Math.floor((now.getTime() - exportedAt.getTime()) / 86400000);
  if (daysSinceExport < EXPORT_REMINDER_DAYS) return "";

  return tr("backupStale", { days: daysSinceExport });
}

export function renderBeanList() {
  const list = coffee.host.querySelector("#bean-list");
  list.innerHTML = getBeanPresets().map((bean) => `
    <div class="bean-row" data-testid="${testIds.beanRow}">
      <span><strong>${escapeHtml(bean.brand)} / ${escapeHtml(bean.blend)}</strong><em>${escapeHtml(bean.roastOrigin || tr("fallbackNoOrigin"))} ${bean.decaf ? `/ ${escapeHtml(tr("fallbackDecaf"))}` : ""}</em></span>
      <button class="secondary" type="button" data-edit-bean="${escapeHtml(bean.id)}" data-testid="${testIds.editBean}">${escapeHtml(tr("buttonEdit"))}</button>
      <button class="danger" type="button" data-delete-bean="${escapeHtml(bean.id)}" data-testid="${testIds.deleteBean}">${escapeHtml(tr("buttonDelete"))}</button>
    </div>
  `).join("");

  list.querySelectorAll("[data-edit-bean]").forEach((button) => {
    button.addEventListener("click", () => {
      const bean = getBeanPreset(button.dataset.editBean);
      coffee.editingBeanId = bean.id;
      coffee.host.querySelector('#bean-form').dataset.expectedBean = JSON.stringify(bean);
      coffee.host.querySelector("#beanBrand").value = bean.brand;
      coffee.host.querySelector("#beanBlend").value = bean.blend;
      coffee.host.querySelector("#beanOrigin").value = bean.roastOrigin;
      coffee.host.querySelector("#beanDecaf").checked = bean.decaf;
      coffee.host.querySelector("#beanBrand").focus();
    });
  });

  list.querySelectorAll("[data-delete-bean]").forEach((button) => {
    button.addEventListener("click", () => {
      try {
        deleteBeanPreset(button.dataset.deleteBean);
        renderBeanList();
        showToastKey("toastBeanDeleted");
      } catch (error) {
        showToast(error.message);
      }
    });
  });
}

export function savePreferences(event) {
    event.preventDefault();
    attempt(() => persistPreferences(event));
}

function persistPreferences(event) {
    event.preventDefault();
    checkSettings(event.currentTarget);
    const data = new FormData(event.currentTarget);
    updateSettings({
      theme: data.get("theme"),
      language: data.get("language"),
      burrTouchReference: data.get("burrTouchReference"),
      toolsConfigured: true,
      tools: readToolSettings(data)
    });
    applyTheme();
    applyLanguage();
    renderTabs();
    renderSettings();
    showToastKey("toastSettingsSaved");
  }

export function saveBean(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      brand: data.get("beanBrand"),
      blend: data.get("beanBlend"),
      roastOrigin: data.get("beanOrigin"),
      decaf: data.get("beanDecaf") === "on"
    };
    try {
      checkBean(form, coffee.editingBeanId);
      if (coffee.editingBeanId) {
        updateBeanPreset(coffee.editingBeanId, payload);
        coffee.editingBeanId = null;
      } else {
        createBeanPreset(payload);
      }
      form.reset();
      renderBeanList();
      showToastKey("toastBeanSaved");
    } catch (error) {
      showToast(error.message);
    }
  }

export function downloadBackup() {
    const drafts = captureDrafts(coffee.host);
    const exportedAt = new Date();
    updateSettings({ lastExportedAt: exportedAt.toISOString() });
    const backup = exportAll();
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `crois-${exportedAt.toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    render();
    restoreDrafts(coffee.host, drafts);
  }

export async function selectImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    try {
      let data;
      try {
        data = JSON.parse(await file.text());
      } catch {
        showToastKey("toastInvalidJson");
        return;
      }
      showImportPreview(coffee.service.previewImport(JSON.stringify(data), coffee.host.querySelector("#importMode").value));
    } catch (error) {
      showToast(error.message);
    }
  }
