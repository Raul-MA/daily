import { generateProgression } from './chord-progressions-exercise-shared.js';
export function generate(ctx) {
    ctx.progression = generateProgression(ctx.root, ctx.scaleName, ctx.length)
    ctx.renderProgression()
  }
