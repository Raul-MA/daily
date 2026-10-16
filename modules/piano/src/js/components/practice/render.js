import { escapeHTML } from './format.js';
import { rememberDisclosures, captureFocus, restoreFocus } from './focus.js';
import { stamp } from './persistence.js';

function content(context) {
  if (context.phase === 'setup') return context.setupHTML();
  if (context.phase === 'session') return `<form id="piano-session">${context.sessionHTML()}</form>`;
  return context.finishHTML();
}
export function render(focusHeading = false) {
  if (this.destroyed) return;
  rememberDisclosures(this);
  const focus = captureFocus(this.container);
  this.container.innerHTML = `<div class="practice-page"><div class="page-header"><h1 tabindex="-1">${escapeHTML(this.lesson().title)}</h1><div class="page-nav-links"><a href="#/">Course</a></div></div>${content(this)}</div>`;
  this.updateClock();
  restoreFocus(this, focus, focusHeading);
  stamp(this);
}
