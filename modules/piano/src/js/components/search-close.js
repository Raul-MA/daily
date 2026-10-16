export function close(ctx) {
    ctx.results.innerHTML = ''
    ctx.results.classList.remove('open')
    ctx.activeIdx = -1
    ctx.currentResults = []
    ctx.status.textContent = ''
    ctx.input.setAttribute('aria-expanded', 'false')
    ctx.input.removeAttribute('aria-activedescendant')
  }
