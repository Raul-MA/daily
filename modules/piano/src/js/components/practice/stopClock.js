
export function stopClock() {
    clearInterval(this.interval)
    this.interval = null
  }
