

import { CHROMATIC_FLATS, transpose, isFlat } from './notes.js'
import { getChordNotes, formatChordName } from './chords.js'
import { getScaleNotes } from './scales.js'


export const ALL_DOMINANT_ROOTS = CHROMATIC_FLATS


export function getTritoneSubstitute(root) {
  const origNotes = getChordNotes(root, '7')
  
  const subRoot = transpose(root, 6, true)
  const subNotes = getChordNotes(subRoot, '7')

  return {
    root,
    chordName: formatChordName(root, '7'),
    notes: origNotes,
    subRoot,
    subChordName: formatChordName(subRoot, '7'),
    subNotes,
  }
}


export function getTritoneSubIIVI(keyRoot) {
  const scaleNotes = getScaleNotes(keyRoot, 'Major')
  const iiRoot = scaleNotes[1]
  const vRoot  = scaleNotes[4]

  const iiChord = { roman: 'iim7',  chordName: formatChordName(iiRoot, 'm7'),  root: iiRoot }
  const vChord  = { roman: 'V7',    chordName: formatChordName(vRoot, '7'),    root: vRoot  }
  const iChord  = { roman: 'Imaj7', chordName: formatChordName(keyRoot, 'maj7'), root: keyRoot }

  const subRoot = transpose(vRoot, 6, true)
  const subChord = { roman: '♭II7',  chordName: formatChordName(subRoot, '7'),  root: subRoot }

  return {
    keyRoot,
    original: [iiChord, vChord, iChord],
    withSub:  [iiChord, subChord, iChord],
  }
}


export function randomTritoneSubQuestion(withContext) {
  const root = ALL_DOMINANT_ROOTS[Math.floor(Math.random() * ALL_DOMINANT_ROOTS.length)]
  const sub = getTritoneSubstitute(root)
  if (!withContext) return sub

  
  
  const tonicRoot = transpose(root, 5, isFlat(root))
  const context = getTritoneSubIIVI(tonicRoot)
  return { ...sub, context }
}
