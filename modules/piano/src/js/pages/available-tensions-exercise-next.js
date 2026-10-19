import { randomChordQuestion } from './available-tensions-exercise-shared.js';
export function next(ctx, filter) {
    ctx.state = { ...ctx.state, question: randomChordQuestion(filter), revealed: false }
    ctx.update()
  }
