import { randomTritoneSubQuestion } from './tritone-sub-exercise-shared.js';
export function next(ctx, filter) {
    const withContext = filter.includes('Context')
    ctx.state = {
      question: randomTritoneSubQuestion(withContext),
      revealed: false,
      withContext,
    }
    ctx.update()
  }
