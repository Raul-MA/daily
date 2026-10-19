import { exerciseState, resumeExercise, exerciseCleanup } from '../../exercise-state.js';
import { createExerciseShell, INTERVAL_NAMES } from './ear-training-exercise-shared.js';
import { stopPlayback } from './ear-training-exercise-stopPlayback.js';
import { playInterval } from './ear-training-exercise-playInterval.js';
import { playNote } from './ear-training-exercise-playNote.js';
import { delay } from './ear-training-exercise-delay.js';
import { next } from './ear-training-exercise-next.js';
import { update } from './ear-training-exercise-update.js';
export default function render(container) {
const ctx = { container };
ctx.stopPlayback = stopPlayback.bind(null, ctx);
ctx.playInterval = playInterval.bind(null, ctx);
ctx.playNote = playNote;
ctx.delay = delay;
ctx.next = next.bind(null, ctx);
ctx.update = update.bind(null, ctx);
ctx.state = exerciseState({ question: null, revealed: false, playing: false, status: 'Press "Play" to start' });
ctx.playback = null;
ctx.shell = createExerciseShell(ctx.container, {
    title: 'Ear Training — Intervals',
    links: [],
    filterLabel: 'Intervals',
    filterOptions: INTERVAL_NAMES,
    buttonLabel: 'New interval',
    onRandom: (filter) => ctx.next(filter),
  });
resumeExercise(ctx)
return exerciseCleanup(ctx, () => {
    ctx.stopPlayback()
    ctx.shell.destroy()
  })
}
