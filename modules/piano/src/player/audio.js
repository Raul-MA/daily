import { EAR_TRAINING_NOTES } from '../js/music/ear-training.js';
import { pianoAsset } from '../js/router.js';

export function createPianoAudio() {
  const context = new AudioContext();
  const buffers = new Map();
  const voices = new Set();
  let disposed = false;
  async function prepare(pitches) {
    await context.resume();
    const samples = new Set(pitches.map(pitch => closestSample(pitch)));
    await Promise.all([...samples].map(async sample => {
      if (buffers.has(sample.midi)) return;
      const response = await fetch(pianoAsset(`assets/notes/${sample.file}.mp3`));
      if (!response.ok) throw new Error(`Piano recording could not load: ${sample.file}`);
      const buffer = await context.decodeAudioData(await response.arrayBuffer());
      if (!disposed) buffers.set(sample.midi, buffer);
    }));
  }
  function register(source, gain, when, until) {
    source.connect(gain); gain.connect(context.destination);
    const voice = { source, gain }; voices.add(voice);
    source.onended = () => { voices.delete(voice); source.disconnect(); gain.disconnect(); };
    source.start(when); source.stop(until);
  }
  function note(event) {
    const sample = closestSample(event.pitch);
    const source = context.createBufferSource(); source.buffer = buffers.get(sample.midi);
    if (!source.buffer) throw new Error('Piano recording is not ready.');
    source.playbackRate.value = 2 ** ((event.pitch - sample.midi) / 12);
    source.loop = true; source.loopStart = Math.max(.1, source.buffer.duration * .65); source.loopEnd = source.buffer.duration;
    const gain = context.createGain();
    gain.gain.setValueAtTime(event.gain * .65, event.when);
    gain.gain.setValueAtTime(event.gain * .65, Math.max(event.when, event.until - .008));
    gain.gain.linearRampToValueAtTime(0, event.until);
    register(source, gain, event.when, event.until);
  }
  function click(event) {
    const source = context.createOscillator(); source.frequency.value = event.strong ? 1400 : 900;
    const until = event.until ?? event.when + .04;
    const gain = context.createGain(); gain.gain.setValueAtTime(event.subdivision ? .025 : .06, event.when);
    gain.gain.exponentialRampToValueAtTime(.0001, Math.min(until, event.when + .035));
    register(source, gain, event.when, until);
  }
  function clear() {
    for (const { source, gain } of voices) { gain.gain.cancelScheduledValues(context.currentTime); gain.gain.value = 0; source.stop(); source.disconnect(); gain.disconnect(); }
    voices.clear();
  }
  return { prepare, note, click, clear, now: () => context.currentTime, dispose: () => { disposed = true; clear(); return context.close(); } };
}
function closestSample(pitch) { return EAR_TRAINING_NOTES.reduce((best, sample) => Math.abs(sample.midi - pitch) < Math.abs(best.midi - pitch) ? sample : best); }
