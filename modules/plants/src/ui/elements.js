import { DataConflictError } from '../../../../packages/data/src/errors.js';
export function el(tag, className = '', text = '') {
  const node = document.createElement(tag);
  node.className = className;
  node.textContent = text;
  return node;
}
export function button(text, action, className = 'btn btn-outline') {
  const node = el('button', className, text);
  node.type = 'button';
  node.onclick = event => {
    try { action(event); }
    finally { document.dispatchEvent(new Event('daily:form-state')); }
  };
  return node;
}
export function anchor(text, href, className = 'btn btn-ghost') {
  const node = el('a', className, text);
  node.href = href;
  return node;
}
export function field(name, text, value = '', type = 'text') {
  const label = el('label', 'form-group');
  label.append(el('span', 'form-label', text));
  const input = el(type === 'textarea' ? 'textarea' : 'input', type === 'textarea' ? 'form-textarea' : 'form-input');
  if (input instanceof HTMLInputElement) input.type = type;
  input.name = name;
  input.value = value;
  label.append(input);
  return label;
}
export function select(name, text, options, value) {
  const label = el('label', 'form-group');
  label.append(el('span', 'form-label', text));
  const input = el('select', 'form-select');
  input.name = name;
  for (const [key, title] of options) {
    const option = el('option', '', title);
    option.value = key;
    input.append(option);
  }
  input.value = value;
  label.append(input);
  return label;
}
export function checkbox(name, text, checked) {
  const label = el('label', 'checkbox-label');
  const input = el('input');
  input.type = 'checkbox';
  input.name = name;
  input.checked = checked;
  label.append(input, el('span', '', text));
  return label;
}
export function submit(text) {
  const node = el('button', 'btn btn-primary', text);
  node.type = 'submit';
  return node;
}
export function announce(context, text, error = false) {
  context.host.querySelector('[data-plant-message]')?.remove();
  const message = el('p', error ? 'storage-error' : 'plant-message', text);
  message.dataset.plantMessage = '';
  message.setAttribute('role', error ? 'alert' : 'status');
  context.host.prepend(message);
}
export function save(context, form, action) {
  if (form) form.dataset.unsaved = 'false';
  try { action(); return true; }
  catch (error) {
    if (form) form.dataset.unsaved = 'true';
    announce(context, error instanceof DataConflictError ? context.copy.changed : context.copy.saveError, true);
    return false;
  } finally {
    document.dispatchEvent(new Event('daily:form-state'));
  }
}
export function confirm(context, options, action) {
  const dialog = el('dialog', 'plant-dialog');
  dialog.setAttribute('aria-label', options.title);
  dialog.append(el('h2', '', options.title), el('p', '', options.message));
  dialog.append(button(context.copy.cancel, () => dialog.close()), button(options.affirm, () => {
    if (save(context, null, action)) dialog.close();
  }, 'btn btn-danger'));
  dialog.onclose = () => dialog.remove();
  context.host.append(dialog);
  dialog.showModal();
}
export function download(text, filename) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const node = anchor('', url);
  node.download = filename;
  node.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
