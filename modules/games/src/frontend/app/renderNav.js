import { renderNavButtons } from './renderNavButtons.js';

export function renderNav(route, hasActive) {
  return `<nav class="main-nav">${renderNavButtons(route, hasActive, false)}</nav>`;
}
