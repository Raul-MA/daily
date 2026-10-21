const paths = {
  settings: '<circle cx="12" cy="12" r="4"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2"/>',
  plants: '<path d="M19 4C9 3 3 9 6 16c7 3 13-3 13-12Z"/><path d="m5 20 9-10"/>',
  coffee: '<path d="M4 8h12v7a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8Zm12 1h2a3 3 0 0 1 0 6h-2M7 3v2m6-2v2"/>',
  games: '<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M8 8h.01M16 8h.01M12 12h.01M8 16h.01M16 16h.01"/>',
  time: '<circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 2"/>',
  piano: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M9 5v14m6-14v14M7 5v7m6-7v7m6-7v7"/>',
  reader: '<path d="M12 5C8 3 4 4 3 5v14c3-2 6-2 9 0 3-2 6-2 9 0V5c-3-2-6-2-9 0ZM12 5v14"/>',
  whatsapp: '<path d="M20 11.5a8 8 0 0 1-12 7L3 20l1.5-5A8 8 0 1 1 20 11.5Z"/><path d="M8 9h8M8 13h5"/>',
  section: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 9h8M8 13h5"/>',
};
export function sidebarIcon(name) {
  const node = document.createElement('span');
  node.className = 'sidebar-icon';
  node.setAttribute('aria-hidden', 'true');
  node.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${paths[name] ?? paths.section}</svg>`;
  return node;
}
