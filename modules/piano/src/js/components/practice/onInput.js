import { copy } from '../../../i18n.js';
import { formatTime } from './format.js';
import { allocateSessionSeconds } from '../practice-allocation.js';
export function onInput(event) {
    const target = event.target
    if (target.name === 'minutes' && target.validity.valid) {
      this.minutes = Number(target.value)
      this.budgets = allocateSessionSeconds(this.minutes)
      this.container.querySelectorAll('[data-preview]').forEach((node, index) => { node.textContent = copy(formatTime(this.budgets[index])) })
      this.container.querySelectorAll('[data-minutes]').forEach(node => {
        const selected = Number(node.dataset.minutes) === this.minutes
        node.setAttribute('aria-pressed', String(selected))
        node.classList.toggle('is-selected', selected)
      })
    }
    if (target.name === 'pace') {
      this.tick()
      const validation = this.container.querySelector('#practice-pace-validation')
      if (!target.validity.valid) {
        this.auto = false
        this.container.querySelector('[name="auto"]').checked = false
        validation.textContent = copy('Enter a whole number from 1 to 300 seconds. Auto-advance is off.')
        this.commitPractice('configurePacing', { auto: false, pace: this.pace });
        this.updateClock()
        return
      }
      validation.textContent = copy('')
      this.pace = Number(target.value)
      this.commitPractice('configurePacing', { auto: this.auto, pace: this.pace });
      this.container.querySelectorAll('[data-pace]').forEach(node => node.setAttribute('aria-pressed', String(Number(node.dataset.pace) === this.pace)))
      this.updateClock()
    }
  }
