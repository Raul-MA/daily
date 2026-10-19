import { escapeHtml } from '../components/components.js';
import { tr, currentLanguage } from './copy.js';

export function pageHeader(title, subtitle) {
  return `
    <header class="page-header">
      <div class="specimen-rail"><span>EST</span><span>${new Date().getFullYear()}</span></div>
      <div>
        <p>Crois</p>
        <h1>${escapeHtml(title)}</h1>
        <span>${escapeHtml(subtitle)}</span>
      </div>
    </header>
  `;
}

export function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function detailItem(label, value) {
  return `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(formatOptional(value))}</dd></div>`;
}

export function detailSection(title, caption, items) {
  return `
    <section class="detail-section">
      <header>
        <p>${escapeHtml(caption)}</p>
        <h2>${escapeHtml(title)}</h2>
      </header>
      <dl>
        ${items.map(([label, value]) => detailItem(label, value)).join("")}
      </dl>
    </section>
  `;
}

export function formatOptional(value) {
  if (value === null || value === undefined || value === "") return "-";
  return value;
}

export function formatBoolean(value) {
  if (value === null || value === undefined) return "-";
  return value ? tr("optionYes") : tr("optionNo");
}

export function formatEnum(value, labels) {
  if (value === null || value === undefined || value === "") return "-";
  return labels[value] || value;
}

export function withUnit(value, unit) {
  if (value === null || value === undefined || value === "") return "-";
  return `${value} ${unit}`;
}

export function formatValueWithUnit(value, unit) {
  if (value === null || value === undefined || value === "") return "-";
  return `${value}${unit || ""}`;
}

export function formatGramValue(value) {
  return formatValueWithUnit(value, "g");
}

export function formatSecondsValue(value) {
  return formatValueWithUnit(value, "s");
}

export function metric(label, value) {
  return `<div class="metric"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`;
}

export function emptyState(title, body) {
  return `<div class="empty-state"><strong>${escapeHtml(title)}</strong><span>${escapeHtml(body)}</span></div>`;
}

export function formatRatio(ratio) {
  return ratio ? `1:${ratio}` : "-";
}

export function formatCompositionRatio(ratio) {
  return ratio ? `${ratio}:1` : "-";
}

export function toDatetimeLocal(iso) {
  const date = new Date(iso);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date - offset).toISOString().slice(0, 16);
}

export function formatDate(iso) {
  return new Intl.DateTimeFormat(currentLanguage() === "es" ? "es-MX" : undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}
