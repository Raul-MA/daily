function editable(control) {
  return control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement || control instanceof HTMLSelectElement;
}

function captureControl(control, index) {
  return { name: control.name, index, value: control.value, checked: control.checked, required: control.required, files: control.files, focused: control === document.activeElement, start: control.selectionStart, end: control.selectionEnd };
}

function captureForm(form) {
  const positions = new Map();
  const controls = Array.from(form.elements).filter(editable).map(control => {
    const index = positions.get(control.name) || 0;
    positions.set(control.name, index + 1);
    return captureControl(control, index);
  });
  return { id: form.id, dataset: { ...form.dataset }, controls };
}

export function captureDrafts(root) {
  return Array.from(root.querySelectorAll('form[data-unsaved="true"]')).filter(form => form.id).map(captureForm);
}

function restoreControl(form, snapshot) {
  const controls = Array.from(form.elements).filter(control => editable(control) && control.name === snapshot.name);
  const control = controls[snapshot.index];
  if (!control) return;
  if (control.type === 'file') control.files = snapshot.files;
  else control.value = snapshot.value;
  if (control.type === 'checkbox' || control.type === 'radio') control.checked = snapshot.checked;
  control.required = snapshot.required;
  if (!snapshot.focused) return;
  control.focus({ preventScroll: true });
  if (typeof snapshot.start === 'number') control.setSelectionRange(snapshot.start, snapshot.end);
}

export function restoreDrafts(root, drafts) {
  for (const draft of drafts) {
    const form = root.querySelector(`form[id="${CSS.escape(draft.id)}"]`);
    if (!form) continue;
    Object.assign(form.dataset, draft.dataset);
    for (const control of draft.controls) restoreControl(form, control);
  }
}
