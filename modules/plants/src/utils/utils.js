export function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}




export function today() {
  return new Date().toLocaleDateString('en-CA');
}


export function nowUTC() {
  return new Date().toISOString();
}




export function dateInputToUTC(localDateStr) {
  if (!localDateStr) return new Date().toISOString();
  const localToday = new Date().toLocaleDateString('en-CA');
  if (localDateStr === localToday) return new Date().toISOString();
  return new Date(localDateStr + 'T12:00:00').toISOString();
}



export function toLocalDateInput(dateStr) {
  if (!dateStr) return today();
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  return new Date(dateStr).toLocaleDateString('en-CA');
}



function toLocalDate(input) {
  if (!input) return '';

  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input;

  return new Date(input).toLocaleDateString('en-CA');
}



export function formatRelative(dateStr) {
  if (!dateStr) return 'Nunca';
  const local = toLocalDate(dateStr);
  const d = new Date(local + 'T00:00:00');
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  const diff = Math.round((d - now) / 86400000);
  if (diff === 0) return 'Hoy';
  if (diff === 1) return 'Mañana';
  if (diff === -1) return 'Ayer';
  if (diff > 1) return `en ${diff} días`;
  return `hace ${Math.abs(diff)} días`;
}

export function formatAbsolute(dateStr) {
  if (!dateStr) return '';
  const d = /^\d{4}-\d{2}-\d{2}$/.test(dateStr)
    ? new Date(dateStr + 'T00:00:00')
    : new Date(dateStr);
  return d.toLocaleDateString('es-MX', { month: 'short', day: 'numeric', year: 'numeric' });
}



export function daysDiff(dateStr) {
  if (!dateStr) return 0;
  const local = toLocalDate(dateStr);
  const d = new Date(local + 'T00:00:00');
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.round((d - now) / 86400000);
}

export function addDays(dateStr, days) {
  const local = toLocalDate(dateStr);
  const d = new Date(local + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString('en-CA');
}

export function addWeeks(dateStr, weeks) {
  return addDays(dateStr, weeks * 7);
}

export function addMonths(dateStr, months) {
  const local = toLocalDate(dateStr);
  const d = new Date(local + 'T00:00:00');
  d.setMonth(d.getMonth() + months);
  return d.toLocaleDateString('en-CA');
}



export function escHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function showToast(message) {
  let toast = document.getElementById('app-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.remove('show');
  void toast.offsetHeight;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 2500);
}

export function confirmDialog(title, message, confirmLabel = 'Confirmar', isDanger = true) {
  return new Promise(resolve => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <h3 id="modal-title">${escHtml(title)}</h3>
        <p>${escHtml(message)}</p>
        <div class="modal-actions">
          <button class="btn btn-ghost" id="modal-cancel">Cancelar</button>
          <button class="btn ${isDanger ? 'btn-danger' : 'btn-primary'}" id="modal-confirm">${escHtml(confirmLabel)}</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const cleanup = result => { overlay.remove(); resolve(result); };
    overlay.querySelector('#modal-cancel').addEventListener('click', () => cleanup(false));
    overlay.querySelector('#modal-confirm').addEventListener('click', () => cleanup(true));
    overlay.addEventListener('click', e => { if (e.target === overlay) cleanup(false); });

    overlay.querySelector('#modal-confirm').focus();
  });
}
