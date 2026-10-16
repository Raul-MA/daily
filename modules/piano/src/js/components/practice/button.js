
export function button(action, label, primary = false, disabled = false) { return `<button type="button" class="btn ${primary ? 'btn-primary' : 'btn-ghost'}" data-action="${action}"${disabled ? ' disabled' : ''}>${label}</button>`; }
