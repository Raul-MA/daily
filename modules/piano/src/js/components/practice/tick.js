import { synchronize, showError } from './persistence.js';

function canAdvance(context) { return !document.hidden && !context.paused && context.auto && context.hasPrompts(); }

export function tick() {
  if (this.destroyed || this.phase !== 'session') return;
  const now = Date.now();
  if (canAdvance(this)) this.pacingDelta += Math.max(0, now - this.lastTime);
  this.lastTime = now;
  synchronize(this);
  if (canAdvance(this) && this.promptElapsed >= this.pace) {
    try { this.nextPrompt(); }
    catch (error) { this.pacingDelta = 0; synchronize(this); showError(this, error); }
  } else this.updateClock();
}
