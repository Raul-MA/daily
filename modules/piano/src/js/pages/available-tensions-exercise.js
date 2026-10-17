import { exerciseState, resumeExercise, exerciseCleanup } from '../../exercise-state.js';
import { copy } from '../../i18n.js';
import { createExerciseShell, CHORD_TYPE_NAMES, CHORD_TYPES } from './available-tensions-exercise-shared.js';
import { next } from './available-tensions-exercise-next.js';
import { update } from './available-tensions-exercise-update.js';
export default function render(container) {
const ctx = { container };
ctx.next = next.bind(null, ctx);
ctx.update = update.bind(null, ctx);
ctx.state = exerciseState({ question: null, revealed: false, showTones: false });
ctx.shell = createExerciseShell(ctx.container, {
    title: 'Available Tensions',
    links: [
      { label: 'Theory', path: '/available-tensions/theory' },
      { label: 'Cards', path: '/available-tensions/cards' },
    ],
    filterLabel: 'Chord type',
    filterOptions: CHORD_TYPE_NAMES.map(k => ({
      label: `${CHORD_TYPES[k].fullName} (${k})`,
      value: k,
    })),
    buttonLabel: 'Random chord',
    onRandom: (filter) => ctx.next(filter),
  });
ctx.controls = ctx.container.querySelector('.exercise-controls');
ctx.toggleBtn = document.createElement('button');
ctx.toggleBtn.className = 'btn btn-ghost btn-sm'
ctx.toggleBtn.textContent = copy(ctx.state.showTones ? 'Hide chord tones' : 'Show chord tones')
ctx.toggleBtn.addEventListener('click', () => {
    ctx.state.showTones = !ctx.state.showTones
    ctx.toggleBtn.textContent = copy(ctx.state.showTones ? 'Hide chord tones' : 'Show chord tones')
    if (ctx.state.revealed) ctx.state.revealed = false
    ctx.update()
  })
ctx.controls.appendChild(ctx.toggleBtn)
resumeExercise(ctx)
return exerciseCleanup(ctx, () => ctx.shell.destroy())
}
