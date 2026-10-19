import { copy } from '../../i18n.js';
export function renderCard(ctx, html) {
    ctx.cardArea.innerHTML = copy(html)
    const card = ctx.cardArea.querySelector('.exercise-card')
    if (card) {
      card.tabIndex = 0
      card.setAttribute('role', 'button')
      card.setAttribute('aria-label', card.classList.contains('revealed') ? 'Hide answer' : 'Reveal answer')
      card.addEventListener('keydown', event => {
        if (event.target === card && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault()
          card.click()
          ctx.cardArea.querySelector('.exercise-card')?.focus()
        }
      })
    }
  }
