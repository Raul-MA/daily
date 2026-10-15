

import { getScaleNotes } from './scales.js'
import { getChordNotes, formatChordName } from './chords.js'
import { CHROMATIC_FLATS } from './notes.js'


const ALL_KEYS = CHROMATIC_FLATS

export const HARMONIC_FUNCTIONS = ['Tonic', 'Predominant', 'Dominant']

export const FUNCTION_DATA = {
  'Major': [
    { roman: 'I',    chordType: 'maj7',   function: 'Tonic',       degreeIndex: 0 },
    { roman: 'ii',   chordType: 'm7',     function: 'Predominant', degreeIndex: 1 },
    { roman: 'iii',  chordType: 'm7',     function: 'Tonic',       degreeIndex: 2 },
    { roman: 'IV',   chordType: 'maj7',   function: 'Predominant', degreeIndex: 3 },
    { roman: 'V',    chordType: '7',      function: 'Dominant',    degreeIndex: 4 },
    { roman: 'vi',   chordType: 'm7',     function: 'Tonic',       degreeIndex: 5 },
    { roman: 'vii°', chordType: 'm7b5',   function: 'Dominant',    degreeIndex: 6 },
  ],
  'Harmonic Minor': [
    { roman: 'i',    chordType: 'mMaj7',  function: 'Tonic',       degreeIndex: 0 },
    { roman: 'ii°',  chordType: 'm7b5',   function: 'Predominant', degreeIndex: 1 },
    { roman: 'III+', chordType: 'augMaj7',function: 'Tonic',       degreeIndex: 2 },
    { roman: 'iv',   chordType: 'm7',     function: 'Predominant', degreeIndex: 3 },
    { roman: 'V',    chordType: '7',      function: 'Dominant',    degreeIndex: 4 },
    { roman: 'VI',   chordType: 'maj7',   function: 'Tonic',       degreeIndex: 5 },
    { roman: 'vii°', chordType: 'dim7',   function: 'Dominant',    degreeIndex: 6 },
  ],
}

export const FUNCTION_SCALE_NAMES = Object.keys(FUNCTION_DATA)


export function randomHarmonicFunctionQuestion(filterFunctions) {
  const scaleName = FUNCTION_SCALE_NAMES[Math.floor(Math.random() * FUNCTION_SCALE_NAMES.length)]
  const keyRoot   = ALL_KEYS[Math.floor(Math.random() * ALL_KEYS.length)]

  const allDegrees = FUNCTION_DATA[scaleName]
  const degrees = filterFunctions && filterFunctions.length > 0
    ? allDegrees.filter(d => filterFunctions.includes(d.function))
    : allDegrees
  if (degrees.length === 0) return randomHarmonicFunctionQuestion(null)

  const degree = degrees[Math.floor(Math.random() * degrees.length)]
  const scaleNotes = getScaleNotes(keyRoot, scaleName)
  const chordRoot  = scaleNotes[degree.degreeIndex]
  const chordName  = formatChordName(chordRoot, degree.chordType)
  const notes      = getChordNotes(chordRoot, degree.chordType)

  return {
    keyRoot,
    scaleName,
    roman:     degree.roman,
    chordType: degree.chordType,
    chordName,
    notes,
    function:  degree.function,
  }
}
