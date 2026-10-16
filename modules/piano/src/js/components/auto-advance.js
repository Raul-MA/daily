
export function createAutoAdvance(container, onChange, { seconds: initialSeconds = 3 } = {}) {
  let intervalId = null
  let destroyed = false
  const el = document.createElement('div')
  el.className = 'auto-advance'
  el.innerHTML = `
    <label>Seconds per prompt
      <input class="auto-advance-seconds" type="number" min="1" max="300" value="${initialSeconds}" aria-label="Auto-advance interval in seconds" />
    </label>
    <button class="btn btn-ghost btn-sm auto-advance-toggle" type="button">Start</button>
  `
  const input = el.querySelector('input')
  const button = el.querySelector('button')
  function stop() {
    clearInterval(intervalId)
    intervalId = null
    button.textContent = 'Start'
    button.classList.replace('btn-primary', 'btn-ghost')
  }
  function start() {
    if (destroyed || document.hidden || !input.checkValidity() || !input.value) return
    stop()
    button.textContent = 'Stop'
    button.classList.replace('btn-ghost', 'btn-primary')
    intervalId = setInterval(onChange, Number(input.value) * 1000)
  }
  input.addEventListener('input', () => {
    const wasRunning = intervalId !== null
    stop()
    if (wasRunning) start()
  })
  button.addEventListener('click', () => intervalId === null ? start() : stop())
  function onVisibility() {
    if (document.hidden) stop()
  }
  document.addEventListener('visibilitychange', onVisibility)
  container.appendChild(el)
  return {
    start,
    stop,
    destroy() {
      stop()
      destroyed = true
      document.removeEventListener('visibilitychange', onVisibility)
      el.remove()
    },
  }
}
