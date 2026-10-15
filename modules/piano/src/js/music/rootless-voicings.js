import { filterPool } from './filter-pool.js';
import { CHORD_TYPES, formatChordName } from './chords.js'
import { getChromaticNotes, getKeyboardRange, getKeyboardVoicing, isFlat, noteToMidi, randomNote, transpose } from './notes.js'

export const ROOTLESS_VOICING_TYPES = ['A', 'B']

export const ROOTLESS_CHORD_TYPES = {
  maj7: {
    label: 'Major 7th',
    symbol: CHORD_TYPES.maj7.symbol,
    usage: 'Imaj7 and tonic-major colors',
    voicings: {
      A: { degrees: ['3', '5', '7', '9'], semitones: [4, 7, 11, 14] },
      B: { degrees: ['7', '9', '3', '5'], semitones: [11, 14, 16, 19] },
    },
  },
  '7': {
    label: 'Dominant 7th',
    symbol: CHORD_TYPES['7'].symbol,
    usage: 'V7 and secondary dominants in comping',
    voicings: {
      A: { degrees: ['3', '13', '♭7', '9'], semitones: [4, 9, 10, 14] },
      B: { degrees: ['♭7', '9', '3', '13'], semitones: [10, 14, 16, 21] },
    },
  },
  m7: {
    label: 'Minor 7th',
    symbol: CHORD_TYPES.m7.symbol,
    usage: 'ii chords and modal-minor sonorities',
    voicings: {
      A: { degrees: ['♭3', '5', '♭7', '9'], semitones: [3, 7, 10, 14] },
      B: { degrees: ['♭7', '9', '♭3', '5'], semitones: [10, 14, 15, 19] },
    },
  },
  m7b5: {
    label: 'Half-Diminished 7th',
    symbol: CHORD_TYPES.m7b5.symbol,
    usage: 'minor-key iiø7 and Locrian contexts',
    voicings: {
      A: { degrees: ['♭3', '♭5', '♭7', '11'], semitones: [3, 6, 10, 17] },
      B: { degrees: ['♭7', '11', '♭3', '♭5'], semitones: [10, 17, 15, 18] },
    },
  },
}

export const ROOTLESS_CHORD_TYPE_KEYS = Object.keys(ROOTLESS_CHORD_TYPES)

function getRootlessKeyPool() {
  
  return getChromaticNotes('flats').map(note => note === 'Gb' ? 'F#' : note)
}

const ROOTLESS_KEYS = getRootlessKeyPool()

function validateChordType(chordType) {
  if (!ROOTLESS_CHORD_TYPES[chordType]) {
    throw new Error(`Unsupported rootless chord type: "${chordType}"`)
  }
}

function validateVoicingType(voicingType) {
  if (!ROOTLESS_VOICING_TYPES.includes(voicingType)) {
    throw new Error(`Unsupported rootless voicing type: "${voicingType}"`)
  }
}

export function getRootlessVoicing(root, chordType, voicingType = 'A') {
  validateChordType(chordType)
  validateVoicingType(voicingType)

  const formula = ROOTLESS_CHORD_TYPES[chordType].voicings[voicingType]
  const useFlats = isFlat(root)

  return formula.semitones.map((semitones, i) => ({
    degree: formula.degrees[i],
    note: transpose(root, semitones, useFlats),
    semitones,
  }))
}

export function splitRootlessHands(voicingTones) {
  return {
    lh: voicingTones.slice(0, 2),
    rh: voicingTones.slice(2),
  }
}


export function getRootlessKeyboards(steps, { startOctave = 4 } = {}) {
  let previous = null
  let rootOctave = startOctave
  const keyboards = steps.map(step => {
    const tones = step.voicingTones.map((tone, index) => ({
      ...tone,
      role: index < 2 ? 'left-hand' : 'right-hand',
      label: `${tone.degree} · ${index < 2 ? 'LH' : 'RH'}`,
    }))
    const candidates = (previous ? [rootOctave, rootOctave - 1, rootOctave + 1] : [rootOctave]).map(octave => {
      const keyboard = getKeyboardVoicing(tones, { root: step.root, startOctave: octave })
      const pitches = keyboard.tones.map(tone => noteToMidi(tone.note, tone.octave))
      const distance = previous ? pitches.reduce((sum, pitch, index) => sum + Math.abs(pitch - previous[index]), 0) : 0
      return { keyboard, pitches, octave, distance }
    })
    const chosen = candidates.reduce((best, candidate) => candidate.distance < best.distance ? candidate : best)
    previous = chosen.pitches
    rootOctave = chosen.octave
    return { ...chosen.keyboard, label: `${step.chordName} — ${step.voicingType} voicing` }
  })
  if (!keyboards.length) return []
  const firstOctave = Math.min(...keyboards.map(keyboard => keyboard.startOctave))
  const endOctave = Math.max(...keyboards.map(keyboard => keyboard.startOctave + keyboard.octaves))
  return keyboards.map(keyboard => ({ ...keyboard, startOctave: firstOctave, octaves: endOctave - firstOctave, range: getKeyboardRange(keyboard.tones) }))
}

export function randomRootlessVoicingQuestion({
  typeFilter = null,
  voicingFilter = null,
  keyFilter = null,
} = {}) {
  const chordTypes = filterPool(ROOTLESS_CHORD_TYPE_KEYS, typeFilter)

  const voicings = filterPool(ROOTLESS_VOICING_TYPES, voicingFilter)

  const keys = filterPool(ROOTLESS_KEYS, keyFilter)

  if (chordTypes.length === 0) throw new Error('randomRootlessVoicingQuestion: empty chord-type pool')
  if (voicings.length === 0) throw new Error('randomRootlessVoicingQuestion: empty voicing pool')
  if (keys.length === 0) throw new Error('randomRootlessVoicingQuestion: empty key pool')

  const chordType = chordTypes[Math.floor(Math.random() * chordTypes.length)]
  const voicingType = voicings[Math.floor(Math.random() * voicings.length)]
  const root = randomNote(keys)

  const voicingTones = getRootlessVoicing(root, chordType, voicingType)
  const hands = splitRootlessHands(voicingTones)

  return {
    key: root,
    root,
    chordType,
    chordName: formatChordName(root, chordType),
    chordLabel: ROOTLESS_CHORD_TYPES[chordType].label,
    voicingType,
    voicingTones,
    hands,
  }
}

function buildMajorTwoFiveOne(root, startVoicing = 'A') {
  validateVoicingType(startVoicing)
  const secondVoicing = startVoicing === 'A' ? 'B' : 'A'
  const iiRoot = transpose(root, 2, isFlat(root))
  const vRoot = transpose(root, 7, isFlat(root))

  const steps = [
    { degree: 'ii', root: iiRoot, chordType: 'm7', voicingType: startVoicing },
    { degree: 'V', root: vRoot, chordType: '7', voicingType: secondVoicing },
    { degree: 'I', root, chordType: 'maj7', voicingType: startVoicing },
  ]

  return steps.map(step => {
    const voicingTones = getRootlessVoicing(step.root, step.chordType, step.voicingType)
    return {
      ...step,
      chordName: formatChordName(step.root, step.chordType),
      voicingTones,
      hands: splitRootlessHands(voicingTones),
    }
  })
}

export function randomRootlessTwoFiveOneQuestion(startVoicing = 'A') {
  const key = randomNote(ROOTLESS_KEYS)
  const secondVoicing = startVoicing === 'A' ? 'B' : 'A'
  const progression = buildMajorTwoFiveOne(key, startVoicing)

  return {
    key,
    label: `${startVoicing}→${secondVoicing}→${startVoicing} rootless voice-leading`,
    progression,
  }
}
