import { gameUI } from './context.js';
import { getRoute, navigate } from './router.js';
import { clearToastTimer } from './clearToastTimer.js';
import { render } from './render.js';

export function dismissToast() {
  if (gameUI.ui.toast?.type === "backup") {
    const alreadyOnSettings = getRoute() === "settings";
    clearToastTimer();
    gameUI.ui.toast = null;
    gameUI.ui.focusExportOnRender = true;
    navigate("settings");
    if (alreadyOnSettings) render();
    return;
  }
  clearToastTimer();
  gameUI.ui.toast = null;
  render();
}
