import { randomGuideToneQuestion } from './guide-tone-exercise-shared.js';
export function next(ctx, filter) {
    ctx.state = {
      question: randomGuideToneQuestion(filter.length > 0 ? filter : null),
      revealed: false,
    }
    ctx.update()
  }
