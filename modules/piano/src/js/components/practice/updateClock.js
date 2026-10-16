import { BLOCKS } from './format.js';
import { formatTime } from './format.js';
export function updateClock() {
    const clock = this.container.querySelector('[data-clock]')
    if (!clock) return
    clock.textContent = `${formatTime(this.elapsed)} elapsed · ${formatTime(Math.max(0, this.minutes * 60 - this.elapsed))} remaining`
    const blockClock = this.container.querySelector('[data-block-clock]')
    blockClock.textContent = `${BLOCKS[this.block]}: ${formatTime(this.blockElapsed[this.block])} / ${formatTime(this.budgets[this.block])} suggested`
    const blockNotice = this.container.querySelector('[data-block-notice]')
    blockNotice.hidden = this.blockElapsed[this.block] < this.budgets[this.block]
    const totalNotice = this.container.querySelector('[data-total-notice]')
    totalNotice.hidden = this.elapsed < this.minutes * 60
    const pacingMode = this.container.querySelector('[data-pacing-mode]')
    if (pacingMode) pacingMode.textContent = this.auto ? 'Automatic' : 'Manual'
    const promptClock = this.container.querySelector('[data-prompt-clock]')
    if (promptClock) promptClock.textContent = this.auto ? `Next prompt in ${Math.ceil(Math.max(0, this.pace - this.promptElapsed))}s${this.paused ? ' (paused)' : ''}` : 'Manual prompts'
  }
