import { exerciseState, resumeExercise, exerciseCleanup } from '../../exercise-state.js';
import { copy } from '../../i18n.js';
import { createExerciseShell, MELODIC_MINOR_MODE_NAMES, EXERCISE_MODES } from './melodic-minor-exercise-shared.js';
import { next } from './melodic-minor-exercise-next.js';
import { update } from './melodic-minor-exercise-update.js';
export default function render(container) {
const ctx = { container };
ctx.next = next.bind(null, ctx);
ctx.update = update.bind(null, ctx);
ctx.state = exerciseState({ question: null, revealed: false, mode: 'spell' });
ctx.shell = createExerciseShell(ctx.container, {
    title: 'Melodic Minor Modes',
    links: [{ label: 'Theory', path: '/melodic-minor/theory' }],
    filterLabel: 'Mode',
    filterOptions: MELODIC_MINOR_MODE_NAMES.map(n => ({ label: n, value: n })),
    buttonLabel: 'Random',
    onRandom: (filter) => ctx.next(filter),
  });
ctx.controls = ctx.container.querySelector('.exercise-controls');
if (ctx.controls) {
    ctx.controls.innerHTML = copy(`
      <div style="display:flex;gap:var(--space-sm);flex-wrap:wrap;justify-content:center;padding:var(--space-sm) 0">
        ${copy(EXERCISE_MODES.map(m => `
          <button class="btn btn-sm mm-mode-btn${m.value === ctx.state.mode ? ' btn-primary' : ' btn-ghost'}"
            data-mode="${m.value}">${copy(m.label)}</button>
        `).join(''))}
      </div>
    `)
    ctx.controls.querySelectorAll('.mm-mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        ctx.state.mode = btn.dataset.mode
        ctx.state.revealed = false
        ctx.next(Array.from(ctx.container.querySelectorAll('.multi-select option:checked')).map(o => o.value))
      })
    })
  }
resumeExercise(ctx)
return exerciseCleanup(ctx, () => ctx.shell.destroy())
}
