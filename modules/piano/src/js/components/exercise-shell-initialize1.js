import { copy } from '../../i18n.js';
export function initialize1(ctx) {
ctx.container.innerHTML = copy(`
    <div class="exercise-shell">
      <div class="page-header">
        <div class="exercise-header-left">
          <h1>${copy(ctx.title)}</h1>
        </div>
        <div class="page-nav-links">${copy(ctx.linksHtml)}</div>
      </div>

      <div class="exercise-controls"></div>

      <div class="card-area"></div>

      <div class="exercise-toolbar">
        <div class="timer-group"></div>

        <button class="btn btn-primary random-btn">${copy(ctx.buttonLabel)}</button>

        ${copy(ctx.filterToolHtml)}
      </div>
    </div>
  `)
}
