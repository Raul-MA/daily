import { exerciseState, resumeExercise, exerciseCleanup } from '../../exercise-state.js';
import { copy } from '../../i18n.js';
import { createExerciseShell, BEBOP_SCALE_NAMES, EXERCISE_MODES } from './bebop-exercise-shared.js';
import { next } from './bebop-exercise-next.js';
import { update } from './bebop-exercise-update.js';
export default function render(container) {
const ctx = { container };
ctx.next = next.bind(null, ctx);
ctx.update = update.bind(null, ctx);
ctx.state = exerciseState({ question: null, revealed: false, mode: 'spell' });
ctx.shell = createExerciseShell(ctx.container, {
    title: 'Bebop Scales',
    links: [{ label: 'Theory', path: '/bebop/theory' }],
    filterLabel: 'Scale type',
    filterOptions: BEBOP_SCALE_NAMES.map(n => ({ label: n, value: n })),
    buttonLabel: 'Random',
    onRandom: (filter) => ctx.next(filter),
  });
ctx.controls = ctx.container.querySelector('.exercise-controls');
if (ctx.controls) {
    ctx.controls.innerHTML = copy(`
      <div style="display:flex;gap:var(--space-sm);flex-wrap:wrap;justify-content:center;padding:var(--space-sm) 0">
        ${copy(EXERCISE_MODES.map(m => `
          <button class="btn btn-sm bebop-mode-btn${m.value === ctx.state.mode ? ' btn-primary' : ' btn-ghost'}"
            data-mode="${m.value}">${copy(m.label)}</button>
        `).join(''))}
      </div>
    `)
    ctx.controls.querySelectorAll('.bebop-mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        ctx.state.mode = btn.dataset.mode
        ctx.state.revealed = false
        ctx.update()
      })
    })
  }
resumeExercise(ctx)
return exerciseCleanup(ctx, () => ctx.shell.destroy())
}
