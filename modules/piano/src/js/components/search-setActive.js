export function setActive(ctx, idx) {
    const items = ctx.results.querySelectorAll('.search-result-item')
    items.forEach(el => {
      el.classList.remove('active')
      el.setAttribute('aria-selected', 'false')
    })
    ctx.input.removeAttribute('aria-activedescendant')
    if (idx >= 0 && idx < items.length) {
      items[idx].classList.add('active')
      items[idx].setAttribute('aria-selected', 'true')
      ctx.input.setAttribute('aria-activedescendant', items[idx].id)
      items[idx].scrollIntoView({ block: 'nearest' })
    }
    ctx.activeIdx = idx
  }
