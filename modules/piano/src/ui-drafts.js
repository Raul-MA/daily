import { captureDrafts, restoreDrafts } from '../../../packages/ui/src/drafts.js';

export function rememberUI(content, ui) {
  ui.drafts = captureDrafts(content);
  ui.disclosures = Array.from(content.querySelectorAll('[data-disclosure]'), node => ({ name: node.dataset.disclosure, open: node.open }));
}
export function restoreUI(content, ui, cleanup) {
  for (const item of ui.disclosures ?? []) {
    const node = content.querySelector(`[data-disclosure="${CSS.escape(item.name)}"]`);
    if (node) node.open = item.open;
  }
  restoreDrafts(content, ui.drafts ?? []);
  cleanup?.restore?.();
  document.dispatchEvent(new Event('daily:form-state'));
}
