import { randomSuspendedSpellQuestion, randomSuspendedIdentifyQuestion, randomSuspendedResolutionQuestion } from './suspended-chords-exercise-shared.js';
export function next(ctx, filter) {
    const mode = ctx.state.mode === 'mixed'
      ? ['spell', 'identify', 'resolve'][Math.floor(Math.random() * 3)]
      : ctx.state.mode

    const question = createQuestion(mode, filter);

    ctx.state = { ...ctx.state, question, revealed: false, promptMode: mode, filter: filter || [] }
    ctx.update()
  }

function createQuestion(mode, filter) {
  if (mode === 'spell') return randomSuspendedSpellQuestion(filter);
  if (mode === 'identify') return randomSuspendedIdentifyQuestion(filter);
  return randomSuspendedResolutionQuestion(filter);
}
