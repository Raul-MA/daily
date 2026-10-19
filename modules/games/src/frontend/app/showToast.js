import { TOAST_DURATION_MS } from './constants.js';
import { clearToastTimer } from './clearToastTimer.js';
import { gameUI } from './context.js';
import { render } from './render.js';

export function showToast(message, type = "success", durationMs = TOAST_DURATION_MS) {
  clearToastTimer();
  gameUI.ui.toast = message ? { message, type, expiresAt: expiry(durationMs) } : null;
  resumeToast();
}

function expiry(durationMs) { return durationMs > 0 ? Date.now() + durationMs : null; }

export function resumeToast() {
  clearToastTimer();
  const expiresAt = gameUI.ui.toast?.expiresAt;
  if (!expiresAt) return;
  const remaining = expiresAt - Date.now();
  if (remaining <= 0) {
    gameUI.ui.toast = null;
    return;
  }
    gameUI.toastTimer = window.setTimeout(() => {
      gameUI.ui.toast = null;
      gameUI.toastTimer = null;
      render();
    }, remaining);
}
