import { element } from './elements.js';
const paths = {
    plants: '<path d="M19 4C9 3 3 9 6 16c7 3 13-3 13-12Z"/><path d="m5 20 9-10"/>',
    activities: '<circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 2"/>',
    review: '<path d="M12 5C8 3 4 4 3 5v14c3-2 6-2 9 0 3-2 6-2 9 0V5c-3-2-6-2-9 0Z"/><path d="M12 5v14"/>',
    reader: '<path d="M12 5C8 3 4 4 3 5v14c3-2 6-2 9 0 3-2 6-2 9 0V5c-3-2-6-2-9 0Z"/><path d="M12 5v14"/>',
    quick: '<path d="M12 5v14M5 12h14"/>',
    piano: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M9 5v14m6-14v14M7 5v7m6-7v7m6-7v7"/>',
};
export function badge(id) {
    const node = element('span', `widget-icon icon-${id}`);
    node.setAttribute('aria-hidden', 'true');
    node.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${paths[id]}</svg>`;
    return node;
}
