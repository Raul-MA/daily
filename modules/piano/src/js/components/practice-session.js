import { restorePracticeInputs, recoverControls } from './practice/drafts.js';
import { preparePersistence, showError } from './practice/persistence.js';
import { LESSONS } from '../music/learning-path.js';
import { allocateSessionSeconds } from './practice-allocation.js';
import { methods } from './practice/index.js';
export { allocateSessionSeconds } from './practice-allocation.js';
export function createPracticeSession(container, lessonId = null) {
 const ctx = { container, lessonId };
 for (const [name, method] of Object.entries(methods)) ctx[name] = method.bind(ctx);
 ctx.lessonIndex = Math.max(0, LESSONS.findIndex(item => item.id === ctx.lessonId));
 ctx.minutes = 10;
 ctx.piano = true;
 ctx.phase = 'setup';
 ctx.block = 0;
 ctx.elapsed = 0;
 ctx.blockElapsed = [0, 0, 0, 0];
 ctx.budgets = allocateSessionSeconds(ctx.minutes);
 ctx.paused = false;
 ctx.pauseReason = '';
 ctx.auto = false;
 ctx.pace = 30;
 ctx.promptElapsed = 0;
 ctx.promptIndex = 0;
 ctx.applicationIndex = 0;
 ctx.prompt = null;
 ctx.revealed = false;
 ctx.interval = null;
 ctx.lastTime = 0;
 ctx.destroyed = false;
 ctx.customDurationOpen = false;
 ctx.pacingOpen = false;
 ctx.reviewOpen = false;
 if (!preparePersistence(ctx)) return () => { ctx.destroyed = true; };
 const guarded = handler => event => {
  try { handler(event); }
  catch (error) { recoverControls(ctx, event); showError(ctx, error); }
 };
 const listeners = { click: ctx.onClick, change: ctx.onChange, input: ctx.onInput, submit: ctx.onSubmit, invalid: ctx.onInvalid };
 for (const [type, listener] of Object.entries(listeners)) {
  listeners[type] = guarded(listener);
  container.addEventListener(type, listeners[type], type === 'invalid');
 }
 document.addEventListener('visibilitychange', ctx.onVisibility);
 ctx.render();
 const cleanup = () => {
 ctx.destroyed = true;
 ctx.stopClock();
 for (const [type, listener] of Object.entries(listeners)) container.removeEventListener(type, listener, type === 'invalid');
 document.removeEventListener('visibilitychange', ctx.onVisibility);
 };
 cleanup.restore = () => restorePracticeInputs(ctx);
 return cleanup;
}
