import { href } from '../../../../packages/platform/src/router.ts';
import { shellText } from '../../../../packages/i18n/src/shell.ts';
import type { Language } from '../../../../packages/data/src/daily-document.ts';
import { element, link } from './elements.ts';
import { apps } from './catalog.ts';

export function navigation(language: Language, base: string) {
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
  const menu = element('details', 'app-menu');
  menu.append(element('summary', '', copy.apps));
  const entries = element('nav', 'app-menu-list');
  entries.setAttribute('aria-label', copy.apps);
  for (const app of apps) entries.append(link(copy[app.key], href({ page: app.page }, base)));
  menu.append(entries);
  controls.append(menu, link(copy.settings, href({ page: 'settings' }, base)));
  header.append(brand, controls);
  return header;
}
