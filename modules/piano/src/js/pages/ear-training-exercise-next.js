import { randomEarTrainingQuestion } from './ear-training-exercise-shared.js';
export function next(ctx, filter) {
    ctx.stopPlayback()
    ctx.state = { question: randomEarTrainingQuestion(filter), revealed: false, playing: false, status: 'Press "Play" to start' }
    ctx.update()
  }
