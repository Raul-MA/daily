import { randomRootlessVoicingQuestion, randomRootlessTwoFiveOneQuestion } from './rootless-voicings-exercise-shared.js';
export function next(ctx, filter) {
    if (ctx.state.mode === 'progression') {
      ctx.state = {
        ...ctx.state,
        question: randomRootlessTwoFiveOneQuestion('A'),
        promptMode: 'progression',
        revealed: false,
      }
      ctx.update()
      return
    }

    const promptMode = mixedMode(ctx.state.mode);

    ctx.state = {
      ...ctx.state,
      question: randomRootlessVoicingQuestion({
        typeFilter: filter.length > 0 ? filter : null,
      }),
      promptMode,
      revealed: false,
    }
    ctx.update()
  }

function mixedMode(mode) {
  if (mode !== 'both') return mode;
  return Math.random() < 0.5 ? 'identify' : 'build';
}
