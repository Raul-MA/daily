export function initialize0(ctx) {
ctx.filterToolHtml = ctx.filterOptions.length > 0 ? `
    <div class="filter-control">
      <div class="filter-btn-row">
        <button class="btn btn-ghost btn-sm filter-btn" aria-expanded="false">${ctx.filterLabel}</button>
        <div class="filter-chips"></div>
      </div>
      <div class="filter-popover">
        <div class="select-label">${ctx.filterLabel}</div>
        <select class="multi-select" multiple size="4" aria-label="${ctx.filterLabel}">
          ${ctx.filterOptions.map(o =>
            `<option value="${o.value}">${o.label}</option>`
          ).join('')}
        </select>
      </div>
    </div>` : '';
}
