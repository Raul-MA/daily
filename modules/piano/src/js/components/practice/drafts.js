import { allocateSessionSeconds } from '../practice-allocation.js';
import { formatTime } from './format.js';
import { synchronize } from './persistence.js';

export function restorePracticeInputs(context) {
  const minutes = context.container.querySelector('[name="minutes"]');
  const piano = context.container.querySelector('[name="piano"]');
  if (piano) context.piano = piano.checked;
  if (minutes?.validity.valid) {
    context.minutes = Number(minutes.value);
    context.budgets = allocateSessionSeconds(context.minutes);
    context.container.querySelectorAll('[data-preview]').forEach((node, index) => { node.textContent = formatTime(context.budgets[index]); });
    updatePresets(context);
  }
  const pace = context.container.querySelector('[name="pace"]');
  if (pace && !pace.validity.valid) context.container.querySelector('#practice-pace-validation').textContent = 'Enter a whole number from 1 to 300 seconds. Auto-advance is off.';
  context.updateClock();
}
function updatePresets(context) {
  for (const node of context.container.querySelectorAll('[data-minutes]')) {
    const selected = Number(node.dataset.minutes) === context.minutes;
    node.setAttribute('aria-pressed', String(selected));
    node.classList.toggle('is-selected', selected);
  }
}
export function recoverControls(context, event) {
  synchronize(context);
  if (event.target.name === 'auto') event.target.checked = context.auto;
  context.updateClock();
}
