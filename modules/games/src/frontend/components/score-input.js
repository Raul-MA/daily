import { escapeHtml } from './components.js';

export function renderScoreInput({ value = '', id = '', name = '', attributes = {}, preview = '' }) {
  const extra = Object.entries(attributes).map(([key, item]) => `${key}="${escapeHtml(item)}"`).join(' ');
  return `<span class="score-entry">
    <input id="${escapeHtml(id)}" name="${escapeHtml(name)}" ${extra} type="text" inputmode="text" enterkeyhint="done" autocomplete="off" value="${escapeHtml(value)}">
    <span class="score-preview" data-testid="score-preview">${escapeHtml(preview)}</span>
  </span>`;
}
