
export function onChange(event) {
    const target = event.target
    if (target.name === 'piano') this.piano = target.checked
    if (target.name === 'auto') {
      this.tick()
      const paceInput = this.container.querySelector('[name="pace"]')
      this.auto = target.checked && paceInput.validity.valid
      target.checked = this.auto
      if (!paceInput.validity.valid) paceInput.reportValidity()
      this.commitPractice('configurePacing', { auto: this.auto, pace: this.pace });
      this.updateClock()
    }
  }
