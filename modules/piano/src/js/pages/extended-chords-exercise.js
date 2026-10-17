import { exerciseState, resumeExercise, exerciseCleanup } from '../../exercise-state.js';
import { createExerciseShell, EXTENDED_CHORD_TYPE_NAMES, EXTENDED_CHORD_TYPES } from './extended-chords-exercise-shared.js';
import { next } from './extended-chords-exercise-next.js';
import { update } from './extended-chords-exercise-update.js';
export default function render(container) {
const ctx = { container };
ctx.next = next.bind(null, ctx);
ctx.update = update.bind(null, ctx);
ctx.state = exerciseState({ question: null, revealed: false });
ctx.shell = createExerciseShell(ctx.container, {
    title: 'Extended Chords',
    links: [
      { label: 'Theory', path: '/extended-chords/theory' },
      { label: 'Available Tensions', path: '/available-tensions/theory' },
    ],
    filterLabel: 'Chord type',
    filterOptions: EXTENDED_CHORD_TYPE_NAMES.map(k => ({
      label: `${EXTENDED_CHORD_TYPES[k].fullName} (${k})`,
      value: k,
    })),
    buttonLabel: 'Random chord',
    onRandom: (filter) => ctx.next(filter),
  });
resumeExercise(ctx)
return exerciseCleanup(ctx, () => ctx.shell.destroy())
}
