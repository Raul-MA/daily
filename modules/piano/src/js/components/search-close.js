import { copy } from '../../i18n.js';
export function close(ctx) {
    ctx.results.innerHTML = copy('')
    ctx.results.classList.remove('open')
    ctx.activeIdx = -1
    ctx.currentResults = []
    ctx.status.textContent = copy('')
    ctx.input.setAttribute('aria-expanded', 'false')
    ctx.input.removeAttribute('aria-activedescendant')
  }
