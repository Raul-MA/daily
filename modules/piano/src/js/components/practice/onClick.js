import { navigate } from '../../router.js';
import { allocateSessionSeconds } from '../practice-allocation.js';

export function onClick(event) {
  const target = event.target.closest('button');
  if (!target || !this.container.contains(target)) return;
  if (target.dataset.minutes) return chooseMinutes(this, target.dataset.minutes);
  if (target.dataset.pace) return choosePace(this, target.dataset.pace);
  const action = target.dataset.action;
  if (!Object.hasOwn(commands, action)) return;
  if (this.phase === 'session') this.tick();
  commands[action](this);
  this.render(['next', 'previous', 'finish', 'next-lesson', 'setup'].includes(action));
}
function chooseMinutes(context, value) {
  context.minutes = Number(value);
  context.budgets = allocateSessionSeconds(context.minutes);
  context.render();
}
function choosePace(context, value) {
  context.tick();
  context.commitPractice('configurePacing', { auto: context.auto, pace: Number(value) });
  context.render();
}
function moveBlock(context, delta) {
  context.commitPractice('setBlock', Math.max(0, Math.min(3, context.block + delta)));
}
function pause(context) {
  context.commitPractice(context.paused ? 'resume' : 'pause');
  context.pauseReason = '';
}
function finish(context) { context.commitPractice('finishSession'); context.stopClock(); context.phase = 'finished'; }
function nextLesson(context) {
  context.lessonIndex++;
  navigate(`/learn?lesson=${encodeURIComponent(context.lesson().id)}`, true);
  context.phase = 'setup';
}
const commands = {
  reveal: context => context.commitPractice('reveal'), prompt: context => context.nextPrompt(),
  next: context => moveBlock(context, 1), previous: context => moveBlock(context, -1), pause, finish,
  repeat: context => context.start(), setup: context => { context.phase = 'setup'; }, 'next-lesson': nextLesson,
};
