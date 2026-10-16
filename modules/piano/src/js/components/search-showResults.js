export function showResults(ctx, items) {
    ctx.currentResults = items
    ctx.activeIdx = -1
    ctx.input.removeAttribute('aria-activedescendant')
    ctx.input.setAttribute('aria-expanded', String(items.length > 0))
    ctx.status.textContent = items.length === 0 && ctx.input.value.trim() ? 'No results. Try a topic such as intervals or chords.' : ''

    if (items.length === 0) {
      ctx.results.innerHTML = ''
      ctx.results.classList.remove('open')
      return
    }

    ctx.results.innerHTML = items.map((item, i) => `
      <a class="search-result-item" href="#${item.path}" role="option" id="search-option-${i}" aria-selected="false" tabindex="-1" data-idx="${i}">
        <span class="search-result-title">${ctx.highlight(item.title, ctx.input.value)}</span>
        <span class="search-result-module">${item.module}</span>
      </a>
    `).join('')
    ctx.results.classList.add('open')
  }
