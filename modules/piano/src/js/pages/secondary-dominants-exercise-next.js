import { randomSecDomQuestion, SEC_DOM_TARGET_NAMES } from './secondary-dominants-exercise-shared.js';
export function next(ctx, filter) {
    const targets = filter.filter(f => SEC_DOM_TARGET_NAMES.includes(f))
    const inverse = filter.includes('Inverse')
    ctx.state = {
      question: randomSecDomQuestion(targets.length > 0 ? targets : null),
      revealed: false,
      inverse,
    }
    ctx.update()
  }
