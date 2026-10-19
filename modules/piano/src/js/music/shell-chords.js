import { filterPool } from './filter-pool.js';
import { CHORD_TYPES, formatChordName, getChordTones } from './chords.js'
import { getChromaticNotes, randomNote } from './notes.js'

export const SHELL_CHORD_TYPES = {
  maj7: { label: 'Major 7th', symbol: CHORD_TYPES.maj7.symbol },
  7: { label: 'Dominant 7th', symbol: CHORD_TYPES['7'].symbol },
  m7: { label: 'Minor 7th', symbol: CHORD_TYPES.m7.symbol },
  m7b5: { label: 'Half-Diminished 7th', symbol: CHORD_TYPES.m7b5.symbol },
  dim7: { label: 'Diminished 7th', symbol: CHORD_TYPES.dim7.symbol },
}

export const SHELL_CHORD_TYPE_KEYS = Object.keys(SHELL_CHORD_TYPES)
export const SHELL_POSITIONS = ['3-7', '7-3']

const SHELL_KEYS = getChromaticNotes('flats').map(note => note === 'Gb' ? 'F#' : note)

export function getShellTones(root, chordType, position = '3-7') {
  if (!SHELL_CHORD_TYPES[chordType]) throw new Error(`Unsupported shell chord type: "${chordType}"`)
  if (!SHELL_POSITIONS.includes(position)) throw new Error(`Unsupported shell position: "${position}"`)

  const tones = getChordTones(root, chordType)
  const third = tones[1]
  const seventh = tones[3]
  return position === '3-7' ? [third, seventh] : [seventh, third]
}

export function randomShellChordQuestion({
  typeFilter = null,
  positionFilter = null,
  keyFilter = null,
} = {}) {
  const types = filterPool(SHELL_CHORD_TYPE_KEYS, typeFilter)

  const positions = filterPool(SHELL_POSITIONS, positionFilter)

  const keys = filterPool(SHELL_KEYS, keyFilter)

  if (types.length === 0) throw new Error('randomShellChordQuestion: empty chord-type pool')
  if (positions.length === 0) throw new Error('randomShellChordQuestion: empty position pool')
  if (keys.length === 0) throw new Error('randomShellChordQuestion: empty key pool')

  const chordType = types[Math.floor(Math.random() * types.length)]
  const position = positions[Math.floor(Math.random() * positions.length)]
  const root = randomNote(keys)
  const shellTones = getShellTones(root, chordType, position)

  return {
    root,
    key: root,
    chordType,
    chordName: formatChordName(root, chordType),
    chordLabel: SHELL_CHORD_TYPES[chordType].label,
    position,
    shellTones,
  }
}
