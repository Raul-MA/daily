


export const CHROMATIC_SHARPS = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']


export const CHROMATIC_FLATS  = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B']


export function getChromaticNotes(accidentalStyle = 'sharps') {
  if (accidentalStyle === true || accidentalStyle === 'flat' || accidentalStyle === 'flats') {
    return CHROMATIC_FLATS
  }
  if (accidentalStyle === false || accidentalStyle === 'sharp' || accidentalStyle === 'sharps') {
    return CHROMATIC_SHARPS
  }
  throw new Error(`Unknown chromatic accidental style: "${accidentalStyle}"`)
}

const NATURAL_NOTES = CHROMATIC_SHARPS.filter(note => !note.includes('#'))
const wrap = (value, size) => ((value % size) + size) % size


export function noteToIndex(note) {
  if (typeof note !== 'string') return null
  const normalized = note.replaceAll('♯', '#').replaceAll('♭', 'b')
    .replaceAll('𝄪', '##').replaceAll('𝄫', 'bb')
  const match = /^([A-G])(#{0,2}|b{1,2})$/.exec(normalized)
  if (!match) return null
  const accidental = match[2].startsWith('b') ? -match[2].length : match[2].length
  return wrap(CHROMATIC_SHARPS.indexOf(match[1]) + accidental, 12)
}


export function noteToMidi(note, octave) {
  if (noteToIndex(note) === null || !Number.isInteger(octave)) {
    throw new TypeError('Expected a valid note name and an integer octave')
  }
  const normalized = note.replaceAll('♯', '#').replaceAll('♭', 'b')
    .replaceAll('𝄪', '##').replaceAll('𝄫', 'bb')
  const accidental = normalized.slice(1)
  const offset = accidental.startsWith('b') ? -accidental.length : accidental.length
  return (octave + 1) * 12 + CHROMATIC_SHARPS.indexOf(normalized[0]) + offset
}


export function getKeyboardRange(tones) {
  if (!Array.isArray(tones) || !tones.length) {
    return { start: { note: 'C', octave: 4 }, end: { note: 'B', octave: 4 } }
  }
  const pitches = tones.map(tone => noteToMidi(tone.note, tone.octave))
  if (pitches.some(pitch => pitch < 0 || pitch > 127)) throw new RangeError('Keyboard pitches must be within MIDI 0–127')
  const isBlack = midi => CHROMATIC_SHARPS[wrap(midi, 12)].includes('#')
  let start = Math.max(0, Math.min(...pitches) - 1)
  let end = Math.min(127, Math.max(...pitches) + 1)
  while (isBlack(start) && start > 0) start--
  while (isBlack(end) && end < 127) end++
  const key = midi => ({ note: CHROMATIC_SHARPS[wrap(midi, 12)], octave: Math.floor(midi / 12) - 1 })
  return { start: key(start), end: key(end) }
}


export function getKeyboardVoicing(tones, { root, startOctave = 4 } = {}) {
  if (!Array.isArray(tones) || !Number.isInteger(startOctave)) {
    throw new TypeError('Expected tones and an integer starting octave')
  }
  const rootMidi = root === undefined ? null : noteToMidi(root, startOctave)
  let previous = -Infinity
  const pitches = []
  const placed = tones.map(value => {
    const tone = typeof value === 'string' ? { note: value } : value
    const midi = placedMidi(tone, { rootMidi, startOctave, previous });
    previous = midi
    pitches.push(midi)
    return { ...tone, octave: (midi - noteToMidi(tone.note, 0)) / 12 }
  })
  const firstOctave = Math.min(startOctave, ...pitches.map(midi => Math.floor(midi / 12) - 1))
  const lastOctave = Math.max(firstOctave, ...pitches.map(midi => Math.floor(midi / 12) - 1))
  return { tones: placed, startOctave: firstOctave, octaves: lastOctave - firstOctave + 1, range: getKeyboardRange(placed) }
}


export function spellInterval(root, semitones, degree) {
  const index = noteToIndex(root)
  const number = Number(String(degree).replace(/^[^0-9]+/, ''))
  if (index === null) throw new Error(`Unknown note: "${root}"`)
  if (!Number.isInteger(semitones) || !Number.isInteger(number) || number < 1) {
    throw new Error('spellInterval: expected integer semitones and a positive degree')
  }
  const direction = semitones < 0 ? -1 : 1
  const letter = NATURAL_NOTES[wrap(NATURAL_NOTES.indexOf(root[0]) + direction * (number - 1), 7)]
  const accidental = wrap(index + semitones - noteToIndex(letter) + 6, 12) - 6
  return letter + (accidental < 0 ? 'b'.repeat(-accidental) : '#'.repeat(accidental))
}


export function indexToNote(index, useFlats = false) {
  const i = ((index % 12) + 12) % 12
  return getChromaticNotes(useFlats)[i]
}


export function transpose(note, semitones, useFlats) {
  const root = noteToIndex(note)
  if (root === null) throw new Error(`Unknown note: "${note}"`)
  const resultIdx = ((root + semitones) % 12 + 12) % 12
  
  const preferFlats = useFlats !== undefined ? useFlats : isFlat(note)
  return indexToNote(resultIdx, preferFlats)
}


export function enharmonic(note) {
  const ENHARMONICS = {
    'C#': 'Db', 'Db': 'C#',
    'D#': 'Eb', 'Eb': 'D#',
    'F#': 'Gb', 'Gb': 'F#',
    'G#': 'Ab', 'Ab': 'G#',
    'A#': 'Bb', 'Bb': 'A#',
  }
  return ENHARMONICS[note] || note
}


export function isFlat(note) {
  return note.includes('b') && note !== 'B'
}


export function isSharp(note) {
  return note.includes('#')
}


export function randomNote(pool) {
  if (pool && pool.length > 0) {
    return pool[Math.floor(Math.random() * pool.length)]
  }
  const index = Math.floor(Math.random() * 12)
  const useFlats = Math.random() < 0.5
  return getChromaticNotes(useFlats)[index]
}


export function semitonesBetween(noteA, noteB) {
  const a = noteToIndex(noteA)
  const b = noteToIndex(noteB)
  if (a === null) throw new Error(`Unknown note: "${noteA}"`)
  if (b === null) throw new Error(`Unknown note: "${noteB}"`)
  return ((b - a) % 12 + 12) % 12
}


export const ALL_NOTES = [...CHROMATIC_SHARPS]

function placedMidi(tone, options) {
  if (tone.octave !== undefined) return noteToMidi(tone.note, tone.octave ?? options.startOctave);
  if (options.rootMidi !== null && tone.semitones !== undefined) return formulaMidi(tone, options.rootMidi);
  let midi = noteToMidi(tone.note, options.startOctave);
  while (midi <= options.previous) midi += 12;
  return midi;
}
function formulaMidi(tone, rootMidi) {
  if (!Number.isInteger(tone.semitones)) throw new TypeError('Semitone offsets must be integers');
  const midi = rootMidi + tone.semitones;
  if (wrap(midi, 12) !== noteToIndex(tone.note)) throw new RangeError('Tone does not match its semitone offset');
  return midi;
}
