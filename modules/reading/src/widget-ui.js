import { element } from './ui/cards.js';

export function widgetButton(text, id, action) {
  const button = element('button', 'reading-widget-button', text);
  button.type = 'button';
  button.dataset.focus = id;
  button.addEventListener('click', action);
  return button;
}

export function widgetStatus(text, error = false) {
  const node = element('p', error ? 'reading-widget-status reading-widget-error' : 'reading-widget-status', text);
  node.setAttribute('role', error ? 'alert' : 'status');
  return node;
}
