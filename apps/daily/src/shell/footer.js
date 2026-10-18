import { element } from './elements.js';

export function shellFooter(context, copy) {
    const footer = element('footer', 'shell-footer');
    const status = element('p', 'save-status', context.saved && !context.error ? copy.saved : '');
    status.setAttribute('role', 'status');
    const system = element('div', 'footer-system');
    system.dataset.footerSystem = '';
    footer.append(element('span', 'footer-local', copy.local), status, system);
    return footer;
}
