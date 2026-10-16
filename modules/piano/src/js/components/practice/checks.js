import { escapeHTML } from './format.js';
export function checks() { return `<ul class="practice-self-checks">${this.lesson().selfChecks.map(check => `<li>${escapeHTML(check)}</li>`).join('')}</ul>`; }
