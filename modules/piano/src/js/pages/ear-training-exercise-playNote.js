import { pianoAsset } from '../router.js';
export function playNote(src, signal) {
    return new Promise((resolve, reject) => {
      const audio = new Audio(pianoAsset(src))
      const finish = error => {
        audio.removeEventListener('ended', ended)
        audio.removeEventListener('error', failed)
        signal.removeEventListener('abort', aborted)
        audio.pause()
        if (error) reject(error)
        else resolve()
      }
      const ended = () => finish()
      const failed = () => finish(new Error('Audio playback failed'))
      const aborted = () => finish()
      audio.addEventListener('ended', ended)
      audio.addEventListener('error', failed)
      signal.addEventListener('abort', aborted, { once: true })
      if (signal.aborted) aborted()
      else audio.play().catch(finish)
    })
  }
