

import { transpose, spellInterval, randomNote } from './notes.js'


export const CHORD_TYPES = {
  'maj7': {
    symbol: 'maj7',
    fullName: 'Major 7th',
    degrees: ['1', '3', '5', '7'],
    intervals: [0, 4, 7, 11],
  },
  '7': {
    symbol: '7',
    fullName: 'Dominant 7th',
    degrees: ['1', '3', '5', '♭7'],
    intervals: [0, 4, 7, 10],
  },
  'm7': {
    symbol: 'm7',
    fullName: 'Minor 7th',
    degrees: ['1', '♭3', '5', '♭7'],
    intervals: [0, 3, 7, 10],
  },
  'mMaj7': {
    symbol: 'mMaj7',
    fullName: 'Minor Major 7th',
    degrees: ['1', '♭3', '5', '7'],
    intervals: [0, 3, 7, 11],
  },
  'dim7': {
    symbol: '°7',
    fullName: 'Diminished 7th',
    degrees: ['1', '♭3', '♭5', '𝄫7'],
    intervals: [0, 3, 6, 9],
  },
  'm7b5': {
    symbol: 'ø7',
    fullName: 'Half-Diminished 7th',
    degrees: ['1', '♭3', '♭5', '♭7'],
    intervals: [0, 3, 6, 10],
  },
  'aug7': {
    symbol: 'aug7',
    fullName: 'Augmented 7th',
    degrees: ['1', '3', '♯5', '♭7'],
    intervals: [0, 4, 8, 10],
  },
  'augMaj7': {
    symbol: 'augMaj7',
    fullName: 'Augmented Major 7th',
    degrees: ['1', '3', '♯5', '7'],
    intervals: [0, 4, 8, 11],
  },
}

export const CHORD_TYPE_NAMES = Object.keys(CHORD_TYPES)


export const AVAILABLE_TENSIONS = {
  'maj7': [
    { degree: '9',   semitones: 2,  description: 'Major 9th — adds color' },
    { degree: '#11', semitones: 6,  description: 'Lydian sound — dreamy' },
    { degree: '13',  semitones: 9,  description: 'Major 13th — fullness' },
  ],
  '7': [
    { degree: 'b9',  semitones: 1,  description: 'Dark, tense' },
    { degree: '9',   semitones: 2,  description: 'Natural, bright' },
    { degree: '#9',  semitones: 3,  description: 'Hendrix chord color' },
    { degree: '#11', semitones: 6,  description: 'Lydian dominant' },
    { degree: 'b13', semitones: 8,  description: 'Dark 13th' },
    { degree: '13',  semitones: 9,  description: 'Bright, full dominant' },
  ],
  'm7': [
    { degree: '9',   semitones: 2,  description: 'Dorian flavor' },
    { degree: '11',  semitones: 5,  description: 'Perfect 11th' },
  ],
  'mMaj7': [
    { degree: '9',   semitones: 2,  description: 'Melodic minor sound' },
    { degree: '11',  semitones: 5,  description: 'Perfect 11th' },
  ],
  'dim7': [
    { degree: 'b9',  semitones: 1,  description: 'Darkens the color' },
    { degree: '9',   semitones: 2,  description: 'Adds brightness' },
    { degree: '11',  semitones: 5,  description: 'Minor 11th tension' },
    { degree: '#11', semitones: 6,  description: 'Tritone tension' },
  ],
  'm7b5': [
    { degree: '9',   semitones: 2,  description: 'Locrian #2 sound' },
    { degree: '11',  semitones: 5,  description: 'Standard 11th' },
    { degree: 'b13', semitones: 8,  description: 'Locrian color' },
  ],
  'aug7': [
    { degree: 'b9',  semitones: 1,  description: 'Whole-tone scale' },
    { degree: '9',   semitones: 2,  description: 'Bright tension' },
  ],
  'augMaj7': [
    { degree: '9',   semitones: 2,  description: 'Melodic minor color' },
    { degree: '#11', semitones: 6,  description: 'Whole-tone tension' },
  ],
}


export function getChordTones(root, chordType, useFlats) {
  const chord = CHORD_TYPES[chordType]
  if (!chord) throw new Error(`Unknown chord type: "${chordType}"`)
  return chord.intervals.map((semitones, i) => ({
    degree: chord.degrees[i],
    note: useFlats !== undefined ? transpose(root, semitones, useFlats) : spellInterval(root, semitones, chord.degrees[i]),
    semitones,
  }))
}


export function getChordNotes(root, chordType, useFlats) {
  return getChordTones(root, chordType, useFlats).map(t => t.note)
}


export function getAvailableTensionNotes(root, chordType) {
  const tensions = AVAILABLE_TENSIONS[chordType] || []
  return tensions.map(t => ({
    ...t,
    note: spellInterval(root, t.semitones, t.degree),
  }))
}


export function formatChordName(root, chordType) {
  const chord = CHORD_TYPES[chordType]
  if (!chord) return `${root}${chordType}`
  return `${root}${chord.symbol}`
}


export const EXTENDED_CHORD_TYPES = {
  'maj9': {
    symbol: 'maj9',
    fullName: 'Major 9th',
    baseChordType: 'maj7',
    degrees: ['1', '3', '5', '7', '9'],
    intervals: [0, 4, 7, 11, 14],
  },
  '9': {
    symbol: '9',
    fullName: 'Dominant 9th',
    baseChordType: '7',
    degrees: ['1', '3', '5', '♭7', '9'],
    intervals: [0, 4, 7, 10, 14],
  },
  'm9': {
    symbol: 'm9',
    fullName: 'Minor 9th',
    baseChordType: 'm7',
    degrees: ['1', '♭3', '5', '♭7', '9'],
    intervals: [0, 3, 7, 10, 14],
  },
  'maj13': {
    symbol: 'maj13',
    fullName: 'Major 13th',
    baseChordType: 'maj7',
    degrees: ['1', '3', '5', '7', '9', '13'],
    intervals: [0, 4, 7, 11, 14, 21],
    omitNote: '11th is omitted in practice',
  },
  '13': {
    symbol: '13',
    fullName: 'Dominant 13th',
    baseChordType: '7',
    degrees: ['1', '3', '5', '♭7', '9', '13'],
    intervals: [0, 4, 7, 10, 14, 21],
    omitNote: '11th is usually omitted; 5th is often omitted in voicings',
  },
  'm11': {
    symbol: 'm11',
    fullName: 'Minor 11th',
    baseChordType: 'm7',
    degrees: ['1', '♭3', '5', '♭7', '9', '11'],
    intervals: [0, 3, 7, 10, 14, 17],
  },
}

export const EXTENDED_CHORD_TYPE_NAMES = Object.keys(EXTENDED_CHORD_TYPES)


export function getExtendedChordTones(root, extType) {
  const chord = EXTENDED_CHORD_TYPES[extType]
  if (!chord) throw new Error(`Unknown extended chord type: "${extType}"`)
  return chord.intervals.map((semitones, i) => ({
    degree: chord.degrees[i],
    note: spellInterval(root, semitones, chord.degrees[i]),
    semitones,
  }))
}


export function randomExtendedChordQuestion(typeFilter) {
  const available = typeFilter && typeFilter.length > 0
    ? EXTENDED_CHORD_TYPE_NAMES.filter(t => typeFilter.includes(t))
    : EXTENDED_CHORD_TYPE_NAMES

  if (available.length === 0) throw new Error('randomExtendedChordQuestion: empty pool after filter')

  const extType   = available[Math.floor(Math.random() * available.length)]
  const root      = randomNote()
  const tones     = getExtendedChordTones(root, extType)
  const baseTones = getChordTones(root, EXTENDED_CHORD_TYPES[extType].baseChordType)
  const name      = `${root}${EXTENDED_CHORD_TYPES[extType].symbol}`

  return { root, extType, name, tones, baseTones }
}


export function randomChordQuestion(typeFilter, roots) {
  const available = typeFilter && typeFilter.length > 0
    ? CHORD_TYPE_NAMES.filter(t => typeFilter.includes(t))
    : CHORD_TYPE_NAMES

  if (available.length === 0) throw new Error('randomChordQuestion: empty pool after filter')

  const chordType = available[Math.floor(Math.random() * available.length)]
  const root      = randomNote(roots)
  const tones     = getChordTones(root, chordType)
  const tensions  = getAvailableTensionNotes(root, chordType)
  const name      = formatChordName(root, chordType)

  return { root, chordType, name, tones, tensions }
}


export function randomChordDegreeQuestion({ roots = ['C', 'D', 'G'], types = ['maj7', 'm7', '7'], degrees = ['3', '7'], reverse = false } = {}) {
  const question = randomChordQuestion(types, roots)
  const degreeNumber = degree => String(degree).replace(/\D/g, '')
  const allowed = degrees.map(degreeNumber)
  const candidates = question.tones.filter(tone => allowed.includes(degreeNumber(tone.degree)))
  if (!candidates.length) throw new Error('randomChordDegreeQuestion: empty degree pool')
  const tone = candidates[Math.floor(Math.random() * candidates.length)]
  const { root, chordType, name, tones } = question
  return { root, chordType, name, degree: tone.degree, note: tone.note, tones, reverse }
}
