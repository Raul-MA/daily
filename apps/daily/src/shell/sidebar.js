import { href } from '../../../../packages/platform/src/router.js';
import { shellText } from '../../../../packages/i18n/src/shell.js';
import { apps } from './catalog.js';
import { element, link } from './elements.js';
import { sections, activeSection } from './sidebar-catalog.js';
import { sidebarIcon } from './sidebar-icons.js';

export function currentApp(route) { return apps.find(app => app.pages.includes(route.page)); }

function menuEntry(label, icon) {
  const node = element('span', 'sidebar-label', label);
  return [sidebarIcon(icon), node];
}

function appSections(context, app, copy) {
  const section = element('section', 'sidebar-section');
  section.dataset.appSections = '';
  section.append(element('h2', 'sidebar-heading', copy.sections));
  const nav = element('nav', 'sidebar-navigation');
  nav.setAttribute('aria-label', copy[app.key]);
  const language = context.state.read().value.preferences.language;
  for (const entry of sections[app.key]) {
    const label = entry[language];
    const destination = entry.aliases?.includes(context.route.page) ? context.route : entry;
    const node = entry.target ? element('button') : link('', href(destination, context.base));
    node.className = 'sidebar-item nav-link';
    node.append(...menuEntry(label, 'section'));
    if (entry.testId) node.dataset.testid = entry.testId;
    if (entry.target) { node.type = 'button'; node.dataset.sidebarTarget = entry.target; }
    else if (activeSection(entry, context.route)) { node.setAttribute('aria-current', 'page'); node.classList.add('active'); }
    nav.append(node);
  }
  section.append(nav);
  return section;
}

function appSwitcher(context, app, copy) {
  const section = element('section', 'sidebar-switcher');
  section.dataset.appSwitcher = '';
  section.append(element('h2', 'sidebar-heading', app ? copy.switchApps : copy.apps));
  const nav = element('nav', 'sidebar-navigation');
  nav.setAttribute('aria-label', copy.apps);
  for (const entry of apps) {
    const node = link('', href({ page: entry.page }, context.base), 'sidebar-item');
    node.append(...menuEntry(copy[entry.key], entry.key));
    if (app?.key === entry.key) node.setAttribute('aria-current', 'true');
    nav.append(node);
  }
  section.append(nav);
  return section;
}

export function sidebar(context, copy) {
  const app = currentApp(context.route);
  const aside = element('aside', 'shell-sidebar');
  aside.id = 'daily-sidebar';
  aside.setAttribute('aria-label', copy.menu);
  const top = element('div', 'sidebar-top');
  const title = element('span', 'sidebar-brand', app ? copy[app.key] : 'daily.');
  const close = element('button', 'sidebar-close', '‹');
  close.type = 'button';
  close.dataset.sidebarClose = '';
  top.append(close, title);
  aside.append(top);
  if (app) aside.append(appSections(context, app, copy));
  aside.append(appSwitcher(context, app, copy));
  return aside;
}

export function menuBackdrop(copy) {
  const node = element('button', 'sidebar-backdrop');
  node.type = 'button';
  node.tabIndex = -1;
  node.dataset.sidebarClose = '';
  node.setAttribute('aria-label', copy.closeMenu);
  node.setAttribute('aria-hidden', 'true');
  return node;
}

export function sidebarCopy(context) { return shellText(context.state.read().value.preferences.language); }
