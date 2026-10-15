import { getChromaticNotes, noteToMidi } from './notes.js'
import { INTERVALS } from './intervals.js'


export const EAR_TRAINING_NOTES = [
  ...[2, 3, 4].flatMap(octave => getChromaticNotes().map(note => ({ note, octave }))),
  { note: 'C', octave: 5 },
].map(tone => ({
  ...tone,
  midi: noteToMidi(tone.note, tone.octave),
  file: `${tone.note[0].toLowerCase()}${tone.octave}${tone.note.includes('#') ? 'sharp' : ''}`,
}))

export function randomEarTrainingQuestion(filter = []) {
  const pool = INTERVALS.filter(interval => interval.semitones >= 1 && interval.semitones <= 12 && (!filter.length || filter.includes(interval.semitones)))
  if (!pool.length) throw new RangeError('No playable intervals selected')
  const interval = pool[Math.floor(Math.random() * pool.length)]
  const roots = EAR_TRAINING_NOTES.filter(root => EAR_TRAINING_NOTES.some(target => target.midi === root.midi + interval.semitones))
  const root = roots[Math.floor(Math.random() * roots.length)]
  const target = EAR_TRAINING_NOTES.find(tone => tone.midi === root.midi + interval.semitones)
  return {
    interval,
    rootFile: root.file,
    targetFile: target.file,
    tones: [
      { note: root.note, octave: root.octave, label: 'First note', role: 'source' },
      { note: target.note, octave: target.octave, label: interval.name, role: 'target' },
    ],
  }
}
