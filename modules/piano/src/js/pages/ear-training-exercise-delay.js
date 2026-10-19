export function delay(ms, signal) {
    return new Promise(resolve => {
      const done = () => {
        clearTimeout(timer)
        signal.removeEventListener('abort', done)
        resolve()
      }
      const timer = setTimeout(done, ms)
      signal.addEventListener('abort', done, { once: true })
      if (signal.aborted) done()
    })
  }
