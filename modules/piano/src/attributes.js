import { copy } from './i18n.js';

export function localizeAttributes(host) {
  for (const node of host.querySelectorAll('[aria-label], [placeholder], [title], [alt]')) {
    for (const attribute of ['aria-label', 'placeholder', 'title', 'alt']) {
      const previous = node.getAttribute(attribute);
      if (previous === null) continue;
      const next = copy(previous);
      if (next !== previous) node.setAttribute(attribute, next);
    }
  }
}
