import { exerciseState, resumeExercise, exerciseCleanup } from '../../exercise-state.js';
import { GUIDE_TONE_PROGRESSIONS, createExerciseShell } from './guide-tone-exercise-shared.js';
import { next } from './guide-tone-exercise-next.js';
import { update } from './guide-tone-exercise-update.js';
export default function render(container) {
const ctx = { container };
ctx.next = next.bind(null, ctx);
ctx.update = update.bind(null, ctx);
ctx.state = exerciseState({ question: null, revealed: false });
ctx.filterOptions = GUIDE_TONE_PROGRESSIONS.map(p => ({
    label: p.label,
    value: p.id,
  }));
ctx.shell = createExerciseShell(ctx.container, {
    title: 'Guide Tone Voice Leading',
    links: [{ label: 'Theory', path: '/chord-substitution/theory' }],
    filterLabel: 'Progression',
    filterOptions: ctx.filterOptions,
    buttonLabel: 'Random',
    onRandom: (filter) => ctx.next(filter),
  });
resumeExercise(ctx)
return exerciseCleanup(ctx, () => ctx.shell.destroy())
}
