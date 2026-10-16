import { escapeHTML } from './format.js';
export function links() { return `${this.phase === 'session' ? '<p class="text-muted">Opening a library reference leaves this lesson. Your practice continues and can be resumed.</p>' : ''}<div class="page-nav-links">${this.lesson().links.map(link => `<a href="#${escapeHTML(link.path)}">${escapeHTML(link.label)}</a>`).join('')}</div>`; }
