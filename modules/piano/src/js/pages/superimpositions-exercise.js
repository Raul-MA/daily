import { exerciseState, resumeExercise, exerciseCleanup } from '../../exercise-state.js';
import { SUPERIMPOSITIONS, createExerciseShell } from './superimpositions-exercise-shared.js';
import { next } from './superimpositions-exercise-next.js';
import { update } from './superimpositions-exercise-update.js';
export default function render(container) {
const ctx = { container };
ctx.next = next.bind(null, ctx);
ctx.update = update.bind(null, ctx);
ctx.state = exerciseState({ question: null, revealed: false });
ctx.filterOptions = [
    ...SUPERIMPOSITIONS.map(s => ({ label: s.colorLabel, value: s.id })),
    { label: 'Reverse drill', value: 'Reverse' },
  ];
ctx.shell = createExerciseShell(ctx.container, {
    title: 'Upper Structures',
    links: [{ label: 'Theory', path: '/superimpositions/theory' }],
    filterLabel: 'Colour / Direction',
    filterOptions: ctx.filterOptions,
    buttonLabel: 'Random',
    onRandom: (filter) => ctx.next(filter),
  });
resumeExercise(ctx)
return exerciseCleanup(ctx, () => ctx.shell.destroy())
}
