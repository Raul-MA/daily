import { playerError } from './errors.js';
import { pianoContext } from '../js/context.js';
import { playerLibrary } from './library.js';
import { renderPage, releaseScores } from './page-render.js';
import { actionHandlers, changeField, importFile, stopPlayer, seek } from './page-actions.js';

export default function render(container) {
  const ctx = { container, library: playerLibrary(pianoContext.service), generation: 0, playRequest: 0, scoreUrls: [], disposed: false };
  ctx.fail = error => { if (!ctx.disposed) container.querySelector('[data-player-error]').textContent = playerError(error.message); };
  const actions = actionHandlers(ctx);
  function click(event) {
    const target = event.target.closest('[data-player-action], [data-seek-tick]');
    if (!target) return;
    if (target.dataset.seekTick !== undefined) { run(() => seek(ctx, Number(target.dataset.seekTick))); return; }
    run(actions[target.dataset.playerAction]);
  }
  function run(action) { Promise.resolve().then(action).catch(ctx.fail); }
  function change(event) { run(() => changeField(ctx, event.target)); }
  function drag(event) { event.preventDefault(); }
  function drop(event) {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) run(() => importFile(ctx, file));
  }
  function visibility() { if (document.hidden) run(actions.pause); }
  container.addEventListener('click', click); container.addEventListener('change', change);
  container.addEventListener('submit', drag); container.addEventListener('dragover', drag); container.addEventListener('drop', drop);
  document.addEventListener('visibilitychange', visibility);
  renderPage(ctx);
  return () => {
    ctx.disposed = true; stopPlayer(ctx); releaseScores(ctx);
    container.removeEventListener('click', click); container.removeEventListener('change', change);
    container.removeEventListener('submit', drag); container.removeEventListener('dragover', drag); container.removeEventListener('drop', drop);
    document.removeEventListener('visibilitychange', visibility);
  };
}
