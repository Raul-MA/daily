import { coffee } from './context.js';
import { translateMessage } from '../../backend/core/i18n.js';
import { getSettings } from '../../backend/features/settings.js';
import { currentLanguage, tr } from './copy.js';

export function applyTheme() { coffee.host.dataset.theme = getSettings().theme; }

export function applyLanguage() { coffee.host.lang = currentLanguage(); }

export function showToastKey(key, params = {}) {
  coffee.notice = { key, params, expires: Date.now() + 3200 };
  restoreToast();
}

export function showToast(message) {
  coffee.notice = { message, expires: Date.now() + 3200 };
  restoreToast();
}

export function restoreToast() {
  clearTimeout(coffee.timer);
  const notice = coffee.notice;
  if (!notice || notice.expires <= Date.now()) {
    coffee.notice = null;
    coffee.toast.hidden = true;
    return;
  }
  coffee.toast.textContent = notice.key ? tr(notice.key, notice.params) : translateMessage(currentLanguage(), notice.message);
  coffee.toast.hidden = false;
  coffee.timer = setTimeout(restoreToast, notice.expires - Date.now());
}

export function attempt(action) {
  try { action(); }
  catch (error) { showToast(error.message); }
  finally { document.dispatchEvent(new Event('daily:form-state')); }
}
