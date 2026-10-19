import { gameUI } from './context.js';

export function clearToastTimer() {
  if (!gameUI.toastTimer) return;
  window.clearTimeout(gameUI.toastTimer);
  gameUI.toastTimer = null;
}
