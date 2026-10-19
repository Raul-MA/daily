

import { CHROMATIC_FLATS, transpose, isFlat } from './notes.js'
import { getScaleNotes } from './scales.js'
import { getChordNotes, formatChordName } from './chords.js'
import { SCALE_HARMONY } from './progressions.js'


export const ALL_MAJOR_KEYS = CHROMATIC_FLATS


export const SEC_DOM_TARGETS = [
  { roman: 'ii',  degreeIndex: 1 },
  { roman: 'iii', degreeIndex: 2 },
  { roman: 'IV',  degreeIndex: 3 },
  { roman: 'V',   degreeIndex: 4 },
  { roman: 'vi',  degreeIndex: 5 },
]

export const SEC_DOM_TARGET_NAMES = SEC_DOM_TARGETS.map(t => t.roman)


export function getSecondaryDominant(keyRoot, targetRoman) {
  const target = SEC_DOM_TARGETS.find(t => t.roman === targetRoman)
  if (!target) throw new Error(`Unknown target degree: "${targetRoman}"`)

  const scaleNotes = getScaleNotes(keyRoot, 'Major')
  const majorHarmony = SCALE_HARMONY['Major']

  const targetNote = scaleNotes[target.degreeIndex]
  const targetChordType = majorHarmony[target.degreeIndex].chordType

  
  const useFlats = isFlat(keyRoot) || isFlat(targetNote)
  const secDomRoot = transpose(targetNote, 7, useFlats)
  const secDomNotes = getChordNotes(secDomRoot, '7')
  const targetNotes = getChordNotes(targetNote, targetChordType)

  return {
    symbol: `V7/${targetRoman}`,
    keyRoot,
    targetRoman,
    targetNote,
    targetChordName: formatChordName(targetNote, targetChordType),
    targetChordType,
    targetNotes,
    secDomRoot,
    secDomChordName: formatChordName(secDomRoot, '7'),
    secDomNotes,
  }
}


export function randomSecDomQuestion(filterTargets) {
  const targets = filterTargets && filterTargets.length > 0
    ? SEC_DOM_TARGETS.filter(t => filterTargets.includes(t.roman))
    : SEC_DOM_TARGETS
  if (targets.length === 0) return randomSecDomQuestion(null)

  const keyRoot = ALL_MAJOR_KEYS[Math.floor(Math.random() * ALL_MAJOR_KEYS.length)]
  const target = targets[Math.floor(Math.random() * targets.length)]
  return getSecondaryDominant(keyRoot, target.roman)
}
