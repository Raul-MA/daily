import { exerciseState, resumeExercise, exerciseCleanup } from '../../exercise-state.js';
import { createExerciseShell } from './tritone-sub-exercise-shared.js';
import { next } from './tritone-sub-exercise-next.js';
import { update } from './tritone-sub-exercise-update.js';
export default function render(container) {
const ctx = { container };
ctx.next = next.bind(null, ctx);
ctx.update = update.bind(null, ctx);
ctx.state = exerciseState({ question: null, revealed: false, withContext: false });
ctx.filterOptions = [
    { label: 'Show ii-V-I context', value: 'Context' },
  ];
ctx.shell = createExerciseShell(ctx.container, {
    title: 'Tritone Substitution',
    links: [{ label: 'Theory', path: '/chord-substitution/theory' }],
    filterLabel: 'Options',
    filterOptions: ctx.filterOptions,
    buttonLabel: 'Random',
    onRandom: (filter) => ctx.next(filter),
  });
resumeExercise(ctx)
return exerciseCleanup(ctx, () => ctx.shell.destroy())
}
