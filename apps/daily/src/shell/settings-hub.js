import { href } from '../../../../packages/platform/src/router.js';
import { shellText } from '../../../../packages/i18n/src/shell.js';
import { element, link } from './elements.js';
import { sidebarIcon } from './sidebar-icons.js';

const destinations = [
  ['plants', { page: 'plantSettings' }],
  ['coffee', { page: 'coffeeSettings' }],
  ['games', { page: 'gamesSettings' }],
  ['time', { page: 'time', query: { section: 'settings' } }],
  ['reader', { page: 'readerSettings' }],
  ['whatsapp', { page: 'whatsappSettings' }],
  ['piano', { page: 'pianoSettings' }],
];

export function settingsGroup(id, title, note) {
  const section = element('section', 'settings-group');
  section.id = id;
  section.setAttribute('aria-labelledby', `${id}-title`);
  const heading = element('h2', 'settings-group-title', title);
  heading.id = `${id}-title`;
  section.append(heading, element('p', 'widget-note', note));
  return section;
}

export function appendAppSettings(view, language, base) {
  const copy = shellText(language);
  const section = settingsGroup('app-settings', copy.appSettings, copy.appsNote);
  const nav = element('nav', 'settings-app-list');
  nav.setAttribute('aria-label', copy.appSettings);
  for (const [key, route] of destinations) {
    const row = link('', href(route, base), 'settings-app-link');
    row.append(sidebarIcon(key), element('span', '', copy[key]));
    const chevron = element('span', 'settings-chevron', '›');
    chevron.setAttribute('aria-hidden', 'true');
    row.append(chevron);
    nav.append(row);
  }
  section.append(nav);
  view.append(section);
}

export function focusSettingsDestination(context) {
  const { route, root } = context;
  const selectors = {
    time: ['section', 'settings', '[data-menu-panel="settings"]'],
  };
  const destination = selectors[route.page];
  if (!destination || route.query.get(destination[0]) !== destination[1]) return false;
  const target = root.querySelector(destination[2]);
  if (!target) return;
  target.dispatchEvent(new Event('daily:show-section'));
  const heading = target.querySelector('h1, h2') ?? target;
  heading.tabIndex = -1;
  heading.focus({ preventScroll: true });
  target.scrollIntoView({ block: 'start' });
  return true;
}
