import { copy } from '../../../i18n.js';
import { escapeHTML } from './format.js';
export function links() { return `${this.phase === 'session' ? `<p class="text-muted">${copy("Opening a library reference leaves this lesson. Your practice continues and can be resumed.")}</p>` : ''}<div class="page-nav-links">${copy(this.lesson().links.map(link => `<a href="#${escapeHTML(link.path)}">${copy(escapeHTML(link.label))}</a>`).join(''))}</div>`; }
