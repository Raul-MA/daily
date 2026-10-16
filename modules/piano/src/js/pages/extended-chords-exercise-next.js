import { randomExtendedChordQuestion } from './extended-chords-exercise-shared.js';
export function next(ctx, filter) {
    ctx.state = { question: randomExtendedChordQuestion(filter), revealed: false }
    ctx.update()
  }
