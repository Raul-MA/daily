

import { getScaleNotes } from './scales.js'
import { getChordNotes, formatChordName } from './chords.js'
import { getChromaticNotes, transpose, isFlat } from './notes.js'



const TRIAD_INTERVALS = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  diminished: [0, 3, 6],
  augmented: [0, 4, 8],
}


const DIATONIC_TRIADS = {
  'Major':          ['major','minor','minor','major','major','minor','diminished'],
  'Natural Minor':  ['minor','diminished','major','minor','minor','major','major'],
  'Harmonic Minor': ['minor','diminished','augmented','minor','major','major','diminished'],
  'Melodic Minor':  ['minor','minor','augmented','major','major','diminished','diminished'],
}


const DIATONIC_SEVENTH_CHORDS = {
  'Major':          ['maj7','m7','m7','maj7','7','m7','m7b5'],
  'Natural Minor':  ['m7','m7b5','maj7','m7','m7','maj7','7'],
  'Harmonic Minor': ['mMaj7','m7b5','augMaj7','m7','7','maj7','dim7'],
  'Melodic Minor':  ['mMaj7','m7','augMaj7','7','7','m7b5','m7b5'],
}


const ROMAN_NUMERALS = {
  'Major':          ['I',   'ii',  'iii', 'IV',  'V',   'vi',  'vii°'],
  'Natural Minor':  ['i',   'ii°', 'III', 'iv',  'v',   'VI',  'VII' ],
  'Harmonic Minor': ['i',   'ii°', 'III+','iv',  'V',   'VI',  'vii°'],
  'Melodic Minor':  ['i',   'ii',  'III+','IV',  'V',   'vi°', 'vii°'],
}

export const INVERSION_NAMES = {
  triad:   ['Root', 'First', 'Second'],
  seventh: ['Root', 'First', 'Second', 'Third'],
}

export const SCALE_NAMES_FOR_INVERSIONS = Object.keys(DIATONIC_TRIADS)

const INVERSION_DEGREES = {
  triad: ['1', '3', '5'],
  seventh: ['1', '3', '5', '7'],
}




function buildTriad(root, quality, useFlats) {
  const intervals = TRIAD_INTERVALS[quality]
  if (!intervals) throw new Error(`Unknown triad quality: "${quality}"`)
  const flats = useFlats !== undefined ? useFlats : isFlat(root)
  return intervals.map(offset => transpose(root, offset, flats))
}


function buildSeventhChord(root, chordType, useFlats) {
  return getChordNotes(root, chordType, useFlats)
}


export function invertChord(notes, inversionIndex) {
  if (inversionIndex === 0) return [...notes]
  const n = notes.length
  const i = inversionIndex % n
  return [...notes.slice(i), ...notes.slice(0, i)]
}


function formatTriadName(root, quality) {
  const SYMBOLS = { major: '', minor: 'm', diminished: '°', augmented: '+' }
  return `${root}${SYMBOLS[quality] ?? quality}`
}

export function getInvertedChordTones(question) {
  const degrees = INVERSION_DEGREES[question.chordMode]
  if (!degrees) throw new Error(`Unknown chord mode: "${question.chordMode}"`)

  return question.invertedNotes.map((note, i) => {
    const originalIndex = (question.inversionIndex + i) % degrees.length
    return { degree: degrees[originalIndex], note }
  })
}




export function randomInversionQuestion({ chordMode = 'both', scaleFilter = [] } = {}) {
  
  const scales = scaleFilter.length > 0
    ? SCALE_NAMES_FOR_INVERSIONS.filter(s => scaleFilter.includes(s))
    : SCALE_NAMES_FOR_INVERSIONS
  const scaleName = scales[Math.floor(Math.random() * scales.length)]

  
  const ALL_ROOTS = getChromaticNotes('flats').map(note => note === 'Gb' ? 'F#' : note)
  const key = ALL_ROOTS[Math.floor(Math.random() * ALL_ROOTS.length)]

  
  const degreeIndex = Math.floor(Math.random() * 7)
  const roman = ROMAN_NUMERALS[scaleName][degreeIndex]

  
  const scaleNotes = getScaleNotes(key, scaleName)
  const chordRoot  = scaleNotes[degreeIndex]

  
  const resolvedMode = resolveChordMode(chordMode)

  const useFlats = isFlat(key)

  
  let allNotes, chordName, chordType
  if (resolvedMode === 'triad') {
    const quality = DIATONIC_TRIADS[scaleName][degreeIndex]
    allNotes  = buildTriad(chordRoot, quality, useFlats)
    chordName = formatTriadName(chordRoot, quality)
    chordType = quality
  } else {
    chordType = DIATONIC_SEVENTH_CHORDS[scaleName][degreeIndex]
    allNotes  = buildSeventhChord(chordRoot, chordType, useFlats)
    chordName = formatChordName(chordRoot, chordType)
  }

  
  const inversionCount = allNotes.length 
  const inversionIndex = Math.floor(Math.random() * inversionCount)
  const inversionName  = INVERSION_NAMES[resolvedMode === 'triad' ? 'triad' : 'seventh'][inversionIndex]

  
  const invertedNotes = invertChord(allNotes, inversionIndex)

  return {
    key,
    scaleName,
    degreeIndex,
    roman,
    chordName,
    chordRoot,
    chordType,
    chordMode: resolvedMode,
    inversionIndex,
    inversionName,
    allNotes,
    invertedNotes,
    bassNote: invertedNotes[0],
  }
}

function resolveChordMode(mode) {
  if (mode !== 'both') return mode;
  return Math.random() < 0.5 ? 'triad' : 'seventh';
}
