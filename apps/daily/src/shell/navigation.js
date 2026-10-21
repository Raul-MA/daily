import { href } from '../../../../packages/platform/src/router.js';
import { shellText } from '../../../../packages/i18n/src/shell.js';
import { element, link } from './elements.js';
export function navigation(language, base) {
    const copy = shellText(language);
    const header = element('header', 'shell-header');
    const brand = link('daily', href({ page: 'home' }, base), 'wordmark');
    brand.append(element('span', 'brand-dot', '.'));
    brand.setAttribute('aria-label', copy.home);
    const controls = element('div', 'header-controls');
    for (const [value, label] of [['en', 'English'], ['es', 'Español']]) {
        const button = element('button', 'language-button', value.toUpperCase());
        button.type = 'button';
        button.setAttribute('aria-label', label);
        button.setAttribute('aria-pressed', String(language === value));
        button.dataset.language = value;
        button.dataset.focus = `language-${value}`;
        controls.append(button);
    }
    const menu = element('button', 'shell-menu-toggle', '☰');
    menu.type = 'button';
    menu.dataset.sidebarToggle = '';
    menu.setAttribute('aria-label', copy.apps);
    menu.setAttribute('aria-controls', 'daily-sidebar');
    menu.setAttribute('aria-expanded', 'false');
    const start = element('div', 'header-start');
    start.append(menu, brand);
    header.append(start, controls);
    return header;
}
