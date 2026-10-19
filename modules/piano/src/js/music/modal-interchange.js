import { CHROMATIC_FLATS } from './notes.js'
import { getScaleNotes } from './scales.js'
import { getChordNotes, formatChordName } from './chords.js'
import { SCALE_HARMONY } from './progressions.js'


export const BORROWED_CHORDS = [
  {
    source: 'Natural Minor',
    degreeIndex: 3,
    romanBorrowed: 'iv',
    description: 'minor subdominant — minor 4th chord borrowed from parallel minor',
  },
  {
    source: 'Natural Minor',
    degreeIndex: 5,
    romanBorrowed: '♭VI',
    description: 'flat submediant — color / predominant chord',
  },
  {
    source: 'Natural Minor',
    degreeIndex: 6,
    romanBorrowed: '♭VII',
    description: 'subtonic dominant — backdoor dominant',
  },
  {
    source: 'Harmonic Minor',
    degreeIndex: 6,
    romanBorrowed: 'vii°7',
    description: 'leading-tone diminished 7th — dominant function',
  },
]

export const BORROWED_CHORD_NAMES = BORROWED_CHORDS.map(b => b.romanBorrowed)

export function getBorrowedChord(keyRoot, romanBorrowed) {
  const borrowed = BORROWED_CHORDS.find(chord => chord.romanBorrowed === romanBorrowed)
  if (!borrowed) throw new Error(`Unknown borrowed chord: "${romanBorrowed}"`)

  const scaleNotes = getScaleNotes(keyRoot, borrowed.source)
  const harmony = SCALE_HARMONY[borrowed.source]
  const chordRoot = scaleNotes[borrowed.degreeIndex]
  const chordType = harmony[borrowed.degreeIndex].chordType

  return {
    keyRoot,
    source: borrowed.source,
    romanBorrowed: borrowed.romanBorrowed,
    description: borrowed.description,
    chordName: formatChordName(chordRoot, chordType),
    chordType,
    notes: getChordNotes(chordRoot, chordType),
  }
}

export function randomBorrowedChordQuestion(filterRomans) {
  const pool = filterRomans && filterRomans.length > 0
    ? BORROWED_CHORDS.filter(chord => filterRomans.includes(chord.romanBorrowed))
    : BORROWED_CHORDS
  if (pool.length === 0) return randomBorrowedChordQuestion(null)

  const keyRoot = CHROMATIC_FLATS[Math.floor(Math.random() * CHROMATIC_FLATS.length)]
  const borrowed = pool[Math.floor(Math.random() * pool.length)]
  return getBorrowedChord(keyRoot, borrowed.romanBorrowed)
}
