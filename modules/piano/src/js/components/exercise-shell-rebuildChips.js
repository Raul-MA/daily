import { copy } from '../../i18n.js';
export function rebuildChips(ctx) {
    if (!ctx.filterChipsEl || !ctx.selectEl) return
    const selected = Array.from(ctx.selectEl.selectedOptions)

    ctx.filterChipsEl.innerHTML = copy(selected.map(o => `
      <span class="chip chip-accent filter-chip-active" data-value="${o.value}">
        ${copy(o.label)}
        <button class="chip-remove" aria-label="Remove ${o.label}">${copy("&times;")}</button>
      </span>
    `).join(''))

    ctx.filterChipsEl.querySelectorAll('.chip-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation()
        const val = btn.closest('.filter-chip-active').dataset.value
        Array.from(ctx.selectEl.options).forEach(opt => {
          if (String(opt.value) === String(val)) opt.selected = false
        })
        ctx.selectEl.dispatchEvent(new Event('change'))
      })
    })
  }
