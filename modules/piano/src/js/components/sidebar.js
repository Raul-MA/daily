import { initSearch } from './search.js';

export function initNavigation(host) {
  return initSearch(host.querySelector('#search-container'));
}
