import { tasteHelp, tr } from './copy.js';
import { iconButton, icons, escapeHtml, fieldRow, segmentedControl } from '../components/components.js';
import { coffee } from './context.js';

export function quickTag(id, label, value, options) {
  const help = tasteHelp();
  const helpButton = help[id]
    ? iconButton(tr("ariaAbout", { label }), icons.info, `data-taste-help="${escapeHtml(id)}"`)
    : "";
  return fieldRow({ id, label, labelAction: helpButton, control: segmentedControl({ id, value: value || "", options, skipLabel: tr("buttonSkip") }) });
}

export function tasteHelpModal() {
  return `
    <div class="taste-help-modal" id="taste-help-modal" hidden>
      <button class="taste-help-backdrop" type="button" aria-label="${escapeHtml(tr("ariaCloseTasteHelp"))}" data-close-taste-help></button>
      <section class="taste-help-dialog" id="taste-help-dialog" role="dialog" aria-modal="true" aria-labelledby="taste-help-title" aria-describedby="taste-help-body" tabindex="-1">
        <header>
          <h2 id="taste-help-title"></h2>
          ${iconButton(tr("ariaCloseTasteHelp"), icons.close, `id="taste-help-close"`)}
        </header>
        <div class="taste-help-body" id="taste-help-body"></div>
      </section>
    </div>
  `;
}

export function openTasteHelp(id, button) {
  const help = tasteHelp()[id];
  const modal = coffee.host.querySelector("#taste-help-modal");
  if (!help || !modal) return;

  coffee.lastTasteHelpButton = button;
  coffee.host.querySelector("#taste-help-title").textContent = help.title;
  coffee.host.querySelector("#taste-help-body").innerHTML = `
    <p>${escapeHtml(help.definition)}</p>
    <ul>
      ${help.questions.map((question) => `<li>${escapeHtml(question)}</li>`).join("")}
    </ul>
  `;
  modal.hidden = false;
  document.addEventListener("keydown", handleTasteHelpKeydown);
  coffee.host.querySelector("#taste-help-dialog").focus();
}

export function closeTasteHelp() {
  const modal = coffee.host.querySelector("#taste-help-modal");
  if (!modal || modal.hidden) return;

  modal.hidden = true;
  document.removeEventListener("keydown", handleTasteHelpKeydown);
  coffee.lastTasteHelpButton?.focus();
  coffee.lastTasteHelpButton = null;
}

export function handleTasteHelpKeydown(event) {
  if (event.key === "Escape") closeTasteHelp();
}
