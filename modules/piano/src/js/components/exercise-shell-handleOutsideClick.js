export function handleOutsideClick(ctx, e) {
    if (
      ctx.filterPopover &&
      ctx.filterPopover.classList.contains('open') &&
      !ctx.filterPopover.contains(e.target) &&
      e.target !== ctx.filterBtn
    ) {
      ctx.filterPopover.classList.remove('open')
      ctx.filterBtn.setAttribute('aria-expanded', 'false')
    }
  }
