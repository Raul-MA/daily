import { randomInversionQuestion } from './chord-inversions-exercise-shared.js';
export function next(ctx, scaleFilter) {
    ctx.state = {
      ...ctx.state,
      question: randomInversionQuestion({ chordMode: ctx.state.chordMode, scaleFilter }),
      revealed: false,
    }
    ctx.update()
  }
