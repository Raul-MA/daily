import { randomShellChordQuestion } from './shell-chords-exercise-shared.js';
export function next(ctx, filter) {
    const question = randomShellChordQuestion({
      typeFilter: filter.length > 0 ? filter : null,
    })
    const promptMode = mixedMode(ctx.state.mode)
    ctx.state = { ...ctx.state, question, revealed: false, promptMode }
    ctx.update()
  }

function mixedMode(mode) {
  if (mode !== 'both') return mode;
  return Math.random() < 0.5 ? 'identify' : 'build';
}
