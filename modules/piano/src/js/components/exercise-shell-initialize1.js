export function initialize1(ctx) {
ctx.container.innerHTML = `
    <div class="exercise-shell">
      <div class="page-header">
        <div class="exercise-header-left">
          <h1>${ctx.title}</h1>
        </div>
        <div class="page-nav-links">${ctx.linksHtml}</div>
      </div>

      <div class="exercise-controls"></div>

      <div class="card-area"></div>

      <div class="exercise-toolbar">
        <div class="timer-group"></div>

        <button class="btn btn-primary random-btn">${ctx.buttonLabel}</button>

        ${ctx.filterToolHtml}
      </div>
    </div>
  `
}
