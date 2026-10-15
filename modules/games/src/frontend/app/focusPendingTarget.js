import { gameUI } from './context.js';
import { testIds } from './testIds.js';

export function focusPendingTarget(route) {
  if (!gameUI.ui.focusExportOnRender || route !== "settings") return;
  gameUI.ui.focusExportOnRender = false;
  const exportButton = gameUI.app.querySelector(`[data-testid="${testIds.exportButton}"]`);
  queueMicrotask(() => {
    exportButton?.scrollIntoView({ block: "center" });
    exportButton?.focus();
  });
}
