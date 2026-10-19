import { copy } from '../i18n.js';
export const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
export const text = value => escape(copy(value));
export function button(action, label) { return `<button type="button" class="btn btn-ghost" data-player-action="${escape(action)}">${text(label)}</button>`; }
export function field(name, label, value, options = '') { return `<label>${text(label)}<input name="${escape(name)}" type="number" value="${escape(value)}" ${options}></label>`; }
export function select(name, label, options, selected) {
  return `<label>${text(label)}<select name="${escape(name)}">${options.map(([value, title]) => `<option value="${escape(value)}"${String(value) === String(selected) ? ' selected' : ''}>${escape(title)}</option>`).join('')}</select></label>`;
}
export function check(name, label, checked) { return `<label class="player-check"><input name="${escape(name)}" type="checkbox"${checked ? ' checked' : ''}>${text(label)}</label>`; }
export function download(content, filename, type = 'application/json') {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a'); link.href = url; link.download = filename; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
