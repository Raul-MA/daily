import { listen } from './events.js';
import { testIds } from './testIds.js';
import { gameUI } from './context.js';
import { render } from './render.js';

export function bindStats() {
  listen(`[data-testid="${testIds.headToHeadA}"]`, "change", (event) => {
    gameUI.ui.headToHeadA = event.target.value;
    render();
  });
  listen(`[data-testid="${testIds.headToHeadB}"]`, "change", (event) => {
    gameUI.ui.headToHeadB = event.target.value;
    render();
  });
}
