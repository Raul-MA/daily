import { restoreExerciseShell } from '../../exercise-state.js';
import { copy } from '../../i18n.js';
import { createAutoAdvance } from './exercise-shell-shared.js';
import { initialize0 } from './exercise-shell-initialize0.js';
import { initialize1 } from './exercise-shell-initialize1.js';
import { rebuildChips } from './exercise-shell-rebuildChips.js';
import { handleOutsideClick } from './exercise-shell-handleOutsideClick.js';
import { renderCard } from './exercise-shell-renderCard.js';
import { destroy } from './exercise-shell-destroy.js';
export { buildExerciseCardHTML, buildChordTonesTableHTML } from './exercise-shell-shared.js';
export function createExerciseShell(container, opts) {
const ctx = { container, opts };
ctx.initialize0 = initialize0.bind(null, ctx);
ctx.initialize1 = initialize1.bind(null, ctx);
ctx.rebuildChips = rebuildChips.bind(null, ctx);
ctx.handleOutsideClick = handleOutsideClick.bind(null, ctx);
ctx.renderCard = renderCard.bind(null, ctx);
ctx.destroy = destroy.bind(null, ctx);
Object.assign(ctx, optionsFor(ctx.opts));
ctx.selectedFilter = [];
ctx.linksHtml = ctx.links.map(l =>
    `<a href="#${l.path}">${copy(l.label)}</a>`
  ).join('');
ctx.initialize0();
ctx.initialize1();
ctx.cardArea = ctx.container.querySelector('.card-area');
ctx.randomBtn = ctx.container.querySelector('.random-btn');
ctx.filterBtn = ctx.container.querySelector('.filter-btn');
ctx.filterPopover = ctx.container.querySelector('.filter-popover');
ctx.filterChipsEl = ctx.container.querySelector('.filter-chips');
ctx.selectEl = ctx.container.querySelector('.multi-select');
ctx.appShell = document.getElementById('app-shell');
if (ctx.appShell) ctx.appShell.classList.add('exercise-mode')
ctx.timer = createAutoAdvance(ctx.container.querySelector('.timer-group'), () => {
    ctx.onRandom(ctx.selectedFilter)
  });
restoreExerciseShell(ctx);
if (ctx.selectEl) {
    ctx.selectEl.addEventListener('change', () => {
      ctx.selectedFilter = Array.from(ctx.selectEl.selectedOptions).map(o => {
        return ctx.filterOptions.find(option => String(option.value) === o.value).value
      })
      ctx.rebuildChips()
    })
  }
if (ctx.filterBtn && ctx.filterPopover) {
    ctx.filterBtn.addEventListener('click', (e) => {
      e.stopPropagation()
      const open = ctx.filterPopover.classList.toggle('open')
      ctx.filterBtn.setAttribute('aria-expanded', String(open))
      if (open) ctx.selectEl.focus()
    })
  }
document.addEventListener('click', ctx.handleOutsideClick)
ctx.filterPopover?.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      ctx.filterPopover.classList.remove('open')
      ctx.filterBtn.setAttribute('aria-expanded', 'false')
      ctx.filterBtn.focus()
    }
  })
ctx.randomBtn.addEventListener('click', () => {
    ctx.onRandom(ctx.selectedFilter)
  })
return { renderCard: ctx.renderCard, destroy: ctx.destroy, cardArea: ctx.cardArea }
}
function optionsFor(opts) {
const {
    title,
    links = [],
    filterLabel = 'Filter',
    filterOptions = [],
    onRandom,
    buttonLabel = 'Next prompt',
  } = opts
return { title, links, filterLabel, filterOptions, onRandom, buttonLabel };
}
