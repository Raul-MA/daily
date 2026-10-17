import { copy } from '../../../i18n.js';
import { escapeHTML } from './format.js';
export function checks() { return `<ul class="practice-self-checks">${copy(this.lesson().selfChecks.map(check => `<li>${copy(escapeHTML(check))}</li>`).join(''))}</ul>`; }
