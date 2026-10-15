import { coffee } from './context.js';
import { translateMessage } from '../../backend/core/i18n.js';
import { getSettings } from '../../backend/features/settings.js';
import { currentLanguage, tr } from './copy.js';

export function applyTheme() { coffee.host.dataset.theme = getSettings().theme; }

export function applyLanguage() { coffee.host.lang = currentLanguage(); }

export function showToastKey(key, params = {}) {
  showToast(tr(key, params));
}

export function showToast(message) {
 coffee.message = message;
 coffee.toast.textContent = message;
 coffee.toast.hidden = false;
 clearTimeout(coffee.timer);
 coffee.timer = setTimeout(() => { coffee.message = ''; coffee.toast.hidden = true; }, 3200);
}

export function attempt(action) {
  try { action(); }
  catch (error) { showToast(translateMessage(currentLanguage(), error.message)); }
  finally { document.dispatchEvent(new Event('daily:form-state')); }
}
