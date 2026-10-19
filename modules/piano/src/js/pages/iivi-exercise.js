import { exerciseState, resumeExercise, exerciseCleanup } from '../../exercise-state.js';
import { createExerciseShell } from './iivi-exercise-shared.js';
import { next } from './iivi-exercise-next.js';
import { update } from './iivi-exercise-update.js';
export default function render(container) {
const ctx = { container };
ctx.next = next.bind(null, ctx);
ctx.update = update.bind(null, ctx);
ctx.state = exerciseState({ question: null, revealed: false, inverse: false });
ctx.filterOptions = [
    { label: 'Major',        value: 'major'   },
    { label: 'Minor',        value: 'minor'   },
    { label: 'Identify mode', value: 'Inverse' },
  ];
ctx.shell = createExerciseShell(ctx.container, {
    title: 'ii-V-I',
    filterLabel: 'Mode',
    filterOptions: ctx.filterOptions,
    buttonLabel: 'Random',
    onRandom: (filter) => ctx.next(filter),
  });
resumeExercise(ctx)
return exerciseCleanup(ctx, () => ctx.shell.destroy())
}
