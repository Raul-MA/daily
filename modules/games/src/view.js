import { gameUI, createGameUI } from './frontend/app/context.js';
import { render } from './frontend/app/render.js';
import { clearToastTimer } from './frontend/app/clearToastTimer.js';
import { conflict, restored } from './frontend/app/drafts.js';
import { resumeToast } from './frontend/app/showToast.js';

export function mountGames(options) {
  const host = document.createElement('section');
  host.dataset.module = 'games';
  if (!options.ui.state) options.ui.state = createGameUI();
  Object.assign(gameUI, { ...options, host, app: host, ui: options.ui.state });
  resumeToast();
  render();
  host.querySelector('h1')?.setAttribute('tabindex', '-1');
  return { node: host, dispose: clearToastTimer, conflict, restore: restored };
}
