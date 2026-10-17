import { copy } from '../../i18n.js';
import { initSearch } from './search.js';
import { PRIMARY_LINKS } from './navigation-data.js';
import { currentPath, pianoHref } from '../router.js';

export function initNavigation(host) {
  const navigation = host.querySelector('.primary-navigation');
  const path = currentPath();
  const section = path === '/' || path === '/learn' ? '/' : '/library';
  for (const item of PRIMARY_LINKS) {
    const link = document.createElement('a');
    link.className = 'nav-link';
    link.href = pianoHref(item.path);
    link.textContent = copy(item.label);
    link.classList.toggle('active', item.path === section);
    if (item.path === section) link.setAttribute('aria-current', 'page');
    navigation.append(link);
  }
  return initSearch(host.querySelector('#search-container'));
}
