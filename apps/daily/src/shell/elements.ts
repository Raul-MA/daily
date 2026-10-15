export function element<K extends keyof HTMLElementTagNameMap>(tag: K, className = '', text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function link(label: string, href: string, className = 'shell-link') {
  const node = element('a', className, label);
  node.href = href;
  return node;
}

export function arrowLink(label: string, href: string) {
  const node = link(label, href, 'module-link');
  const arrow = element('span', 'link-arrow', '→');
  arrow.setAttribute('aria-hidden', 'true');
  node.append(arrow);
  return node;
}

export function heading(text: string) {
  const node = element('h1', 'daily-heading', text);
  node.tabIndex = -1;
  return node;
}
