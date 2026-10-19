import { copy } from '../../i18n.js';
export function initialize0(ctx) {
ctx.filterToolHtml = ctx.filterOptions.length > 0 ? `
    <div class="filter-control">
      <div class="filter-btn-row">
        <button class="btn btn-ghost btn-sm filter-btn" aria-expanded="false">${copy(ctx.filterLabel)}</button>
        <div class="filter-chips"></div>
      </div>
      <div class="filter-popover">
        <div class="select-label">${copy(ctx.filterLabel)}</div>
        <select class="multi-select" multiple size="4" aria-label="${ctx.filterLabel}">
          ${copy(ctx.filterOptions.map(o =>
            `<option value="${o.value}">${copy(o.label)}</option>`
          ).join(''))}
        </select>
      </div>
    </div>` : '';
}
