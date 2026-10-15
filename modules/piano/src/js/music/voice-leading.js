

import { getChordTones, formatChordName } from './chords.js'
import { transpose, isFlat, randomNote, semitonesBetween, getKeyboardRange, getKeyboardVoicing, noteToMidi } from './notes.js'



export const GUIDE_TONE_PROGRESSIONS = [
  {
    id: 'iim7-V7',
    label: 'iim7 → V7',
    fromChordType: 'm7',
    toChordType: '7',
    
    rootInterval: 5,
    
    resolutions: [
      { toIdx: 3 },
      { toIdx: 1 },
    ],
  },
  {
    id: 'V7-Imaj7',
    label: 'V7 → Imaj7',
    fromChordType: '7',
    toChordType: 'maj7',
    rootInterval: 5,
    
    resolutions: [
      { toIdx: 0 },
      { toIdx: 1 },
    ],
  },
  {
    id: 'bII7-Imaj7',
    label: '♭II7 → Imaj7',
    fromChordType: '7',
    toChordType: 'maj7',
    
    rootInterval: 11,
    
    resolutions: [
      { toIdx: 1 },
      { toIdx: 0 },
    ],
  },
]

export const GUIDE_TONE_PROGRESSION_IDS = GUIDE_TONE_PROGRESSIONS.map(p => p.id)




export function getMotionLabel(fromNote, toNote) {
  const up = semitonesBetween(fromNote, toNote)
  if (up === 0) return 'common tone'
  const down = 12 - up
  if (up < down) {
    if (up === 1) return '½ step up'
    if (up === 2) return 'whole step up'
    return `${up} semitones up`
  }
  if (down === 1) return '½ step down'
  if (down === 2) return 'whole step down'
  return `${down} semitones down`
}




const GUIDE_TONE_INDICES = [1, 3]


export function computeGuideTonesMotion(from, to, resolutions) {
  const fromTones = getChordTones(from.root, from.type)
  const toTones   = getChordTones(to.root, to.type)

  return GUIDE_TONE_INDICES.map((fromIdx, i) => {
    const fromTone = fromTones[fromIdx]
    const toTone   = toTones[resolutions[i].toIdx]
    return {
      fromDegree: fromTone.degree,
      fromNote:   fromTone.note,
      toDegree:   toTone.degree,
      toNote:     toTone.note,
      motion:     getMotionLabel(fromTone.note, toTone.note),
    }
  })
}




export function randomGuideToneQuestion(typeFilter) {
  const available = typeFilter && typeFilter.length > 0
    ? GUIDE_TONE_PROGRESSIONS.filter(p => typeFilter.includes(p.id))
    : GUIDE_TONE_PROGRESSIONS

  if (available.length === 0) throw new Error('randomGuideToneQuestion: empty pool after filter')

  const prog     = available[Math.floor(Math.random() * available.length)]
  const fromRoot = randomNote()
  const useFlats = isFlat(fromRoot)
  const toRoot   = transpose(fromRoot, prog.rootInterval, useFlats)

  const fromChordName = formatChordName(fromRoot, prog.fromChordType)
  const toChordName   = formatChordName(toRoot,   prog.toChordType)

  const motions = computeGuideTonesMotion(
    { root: fromRoot, type: prog.fromChordType },
    { root: toRoot, type: prog.toChordType },
    prog.resolutions,
  )

  return {
    progId:        prog.id,
    label:         prog.label,
    fromRoot,
    toRoot,
    fromChordType: prog.fromChordType,
    toChordType:   prog.toChordType,
    fromChordName,
    toChordName,
    motions,
  }
}


export function getKeyboardMotion(motions, { startOctave = 4 } = {}) {
  const source = getKeyboardVoicing(motions.map(motion => ({
    note: motion.fromNote, degree: motion.fromDegree, role: 'source',
  })), { startOctave })
  const targets = motions.map((motion, index) => {
    const sourceTone = source.tones[index]
    const distance = semitonesBetween(motion.fromNote, motion.toNote)
    const signedDistance = distance > 6 ? distance - 12 : distance
    const pitch = noteToMidi(sourceTone.note, sourceTone.octave) + signedDistance
    return {
      note: motion.toNote,
      degree: motion.toDegree,
      role: 'target',
      octave: (pitch - noteToMidi(motion.toNote, 0)) / 12,
    }
  })
  const pitches = [...source.tones, ...targets].map(tone => noteToMidi(tone.note, tone.octave))
  const firstOctave = Math.floor((Math.min(...pitches) - noteToMidi('C', 0)) / 12)
  const lastOctave = Math.floor((Math.max(...pitches) - noteToMidi('C', 0)) / 12)
  const range = { startOctave: firstOctave, octaves: lastOctave - firstOctave + 1, range: getKeyboardRange(source.tones) }
  return [{ ...range, tones: source.tones }, { ...range, range: getKeyboardRange(targets), tones: targets }]
}
