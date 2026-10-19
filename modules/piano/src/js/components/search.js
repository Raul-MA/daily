import { navigate } from '../router.js';
import { search } from './search-shared.js';
import { initialize0 } from './search-initialize0.js';
import { showResults } from './search-showResults.js';
import { highlight } from './search-highlight.js';
import { setActive } from './search-setActive.js';
import { close } from './search-close.js';
export function initSearch(container) {
const ctx = { container, controller: new AbortController() };
ctx.initialize0 = initialize0.bind(null, ctx);
ctx.showResults = showResults.bind(null, ctx);
ctx.highlight = highlight;
ctx.setActive = setActive.bind(null, ctx);
ctx.close = close.bind(null, ctx);
ctx.initialize0();
ctx.input = ctx.container.querySelector('.search-input');
ctx.results = ctx.container.querySelector('.search-results');
ctx.status = ctx.container.querySelector('.search-status');
ctx.activeIdx = -1;
ctx.currentResults = [];
ctx.input.addEventListener('input', () => {
    ctx.showResults(search(ctx.input.value))
  })
ctx.input.addEventListener('keydown', e => {
    const items = ctx.results.querySelectorAll('.search-result-item')
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      ctx.setActive(Math.min(ctx.activeIdx + 1, items.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      ctx.setActive(Math.max(ctx.activeIdx - 1, 0))
    } else if (e.key === 'Enter') {
      if (ctx.activeIdx >= 0 && ctx.currentResults[ctx.activeIdx]) {
        e.preventDefault()
        navigate(ctx.currentResults[ctx.activeIdx].path)
        ctx.input.value = ''
        ctx.close()
        ctx.input.blur()
      }
    } else if (e.key === 'Escape') {
      ctx.close()
    }
  })
window.addEventListener('hashchange', ctx.close, { signal: ctx.controller.signal })
ctx.container.addEventListener('focusout', event => {
    if (!ctx.container.contains(event.relatedTarget)) ctx.close()
  })
ctx.results.addEventListener('click', event => {
    const link = event.target.closest('a')
    if (!link) return
    event.preventDefault()
    navigate(link.hash.slice(1))
    ctx.input.value = ''
    ctx.close()
  })
document.addEventListener('click', e => {
    if (!ctx.container.contains(e.target)) ctx.close()
  }, { signal: ctx.controller.signal })
ctx.input.addEventListener('focus', () => {
    if (ctx.input.value.trim()) ctx.showResults(search(ctx.input.value))
  })
return () => ctx.controller.abort();
}

