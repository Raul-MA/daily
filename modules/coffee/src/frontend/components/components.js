export function fieldRow({ id, label, control, hint = "", attrs = "", labelAction = "" }) {
  const safeId = escapeHtml(id);
  return `
    <div class="field-row" ${attrs}>
      <div class="field-label-row">
        <label class="field-label" id="${safeId}-label" for="${safeId}">${escapeHtml(label)}</label>
        ${labelAction}
      </div>
      <span class="field-control">${control}</span>
      ${hint ? `<span class="field-hint">${escapeHtml(hint)}</span>` : ""}
    </div>
  `;
}

export function textInput({ id, value = "", placeholder = "", type = "text", required = false }) {
  const safeId = escapeHtml(id);
  return `<input id="${safeId}" name="${safeId}" type="${escapeHtml(type)}" value="${escapeHtml(value)}" placeholder="${escapeHtml(placeholder)}" ${required ? "required" : ""}>`;
}

export function numberInput({ id, value = "", step = "any", min = "", max = "", unit = "" }) {
  const safeId = escapeHtml(id);
  return `
    <span class="unit-input">
      <input id="${safeId}" name="${safeId}" type="number" inputmode="decimal" value="${escapeHtml(value ?? "")}" step="${escapeHtml(step)}" ${optionalAttribute("min", min)} ${optionalAttribute("max", max)}>
      ${unit ? `<span>${escapeHtml(unit)}</span>` : ""}
    </span>
  `;
}

export function textarea({ id, value = "", placeholder = "" }) {
  const safeId = escapeHtml(id);
  return `<textarea id="${safeId}" name="${safeId}" placeholder="${escapeHtml(placeholder)}">${escapeHtml(value)}</textarea>`;
}

export function toggle({ id, checked = false }) {
  const safeId = escapeHtml(id);
  return `
    <label class="toggle" for="${safeId}">
      <input id="${safeId}" name="${safeId}" type="checkbox" ${checked ? "checked" : ""}>
      <span aria-hidden="true"></span>
    </label>
  `;
}

export function selectInput({ id, value = "", options = [] }) {
  const safeId = escapeHtml(id);
  return `
    <select id="${safeId}" name="${safeId}">
      ${options.map((option) => `<option value="${escapeHtml(option.value)}" ${option.value === value ? "selected" : ""}>${escapeHtml(option.label)}</option>`).join("")}
    </select>
  `;
}

export function segmentedControl({ id, value = "", options = [], skipLabel = "Skip" }) {
  const safeId = escapeHtml(id);
  return `
    <div class="segmented" role="radiogroup" aria-labelledby="${safeId}-label">
      <input class="choice-input" type="radio" name="${safeId}" id="${safeId}" value="" ${value === null || value === "" ? "checked" : ""}>
      <label for="${safeId}">${escapeHtml(skipLabel)}</label>
      ${options.map((option) => `
        <input class="choice-input" type="radio" name="${safeId}" id="${safeId}-${escapeHtml(option.value)}" value="${escapeHtml(option.value)}" ${option.value === value ? "checked" : ""}>
        <label for="${safeId}-${escapeHtml(option.value)}">${escapeHtml(option.label)}</label>
      `).join("")}
    </div>
  `;
}

export function sliderInput({ id, value = "", skipLabel = "Skip" }) {
  const hasValue = value !== "" && value !== null && value !== undefined;
  const safeId = escapeHtml(id);
  const safeValue = escapeHtml(hasValue ? value : 6);
  return `
    <span class="slider-pair">
      <input id="${safeId}" type="range" min="1" max="10" step="1" value="${safeValue}" data-score-range>
      <input type="hidden" name="${safeId}" value="${hasValue ? escapeHtml(value) : ""}" data-score-value>
      <output for="${safeId}">${hasValue ? escapeHtml(value) : escapeHtml(skipLabel)}</output>
      <button type="button" class="secondary mini" data-skip-score>${escapeHtml(skipLabel)}</button>
    </span>
  `;
}

export function section(title, body, caption = "") {
  return `
    <section class="specimen-section">
      <header>
        <p>${escapeHtml(caption)}</p>
        <h2>${escapeHtml(title)}</h2>
      </header>
      <div class="section-body">${body}</div>
    </section>
  `;
}

export function iconButton(label, icon, attrs = "") {
  return `<button class="icon-button" type="button" aria-label="${escapeHtml(label)}" title="${escapeHtml(label)}" ${attrs}>${icon}</button>`;
}

export const icons = {
  plus: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>`,
  save: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5h12l2 2v12H5z"/><path d="M8 5v6h8"/><path d="M8 19v-5h8v5"/></svg>`,
  trash: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16"/><path d="M9 7V5h6v2"/><path d="M7 7l1 13h8l1-13"/></svg>`,
  edit: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13 7l4 4"/></svg>`,
  download: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11"/><path d="M7 10l5 5 5-5"/><path d="M5 20h14"/></svg>`,
  upload: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V5"/><path d="M7 10l5-5 5 5"/><path d="M5 20h14"/></svg>`,
  close: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>`,
  info: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/></svg>`
};

export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function optionalAttribute(name, value) { return value !== '' ? `${name}="${escapeHtml(value)}"` : ''; }
