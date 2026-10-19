

import { transpose, noteToIndex, isFlat, indexToNote } from './notes.js'
import { randomNote } from './notes.js'


const FLAT_MAJOR_KEYS = new Set(['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'])



const SCALE_PARENT_MAJOR_OFFSET = {
  'Major':                       0,
  'Natural Minor':               3,
  'Harmonic Minor':              3,
  'Melodic Minor':               3,
  'Minor Pentatonic':            3,
  'Major Pentatonic':            0,
  'Blues Minor':                 3,
  'Blues Major':                 0,
  'Dorian':                     10,
  'Phrygian':                    8,
  'Mixolydian':                  5,
  'Bebop Major':                 0,
  'Bebop Dominant':              5,
  'Bebop Minor':                10,
  'Bebop Melodic Minor':         3,
}

export const BEBOP_SCALE_NAMES = ['Bebop Dominant', 'Bebop Major', 'Bebop Minor', 'Bebop Melodic Minor']

export const BEBOP_SCALE_CONTEXT = {
  'Bebop Dominant': {
    chordFit: 'Dominant 7th (7)',
    chord: 'Dominant 7th (C7, G7…)',
    parentScale: 'Mixolydian',
    degree: 'V7',
  },
  'Bebop Major': {
    chordFit: 'Major 7th (maj7)',
    chord: 'Major 7th (Cmaj7, Fmaj7…)',
    parentScale: 'Ionian (Major)',
    degree: 'Imaj7 / IVmaj7',
  },
  'Bebop Minor': {
    chordFit: 'Minor 7th (m7)',
    chord: 'Minor 7th (Cm7, Dm7…)',
    parentScale: 'Dorian',
    degree: 'IIm7 / Im7',
  },
  'Bebop Melodic Minor': {
    chordFit: 'Minor-Major 7th (mMaj7)',
    chord: 'Minor-Major 7th (CmMaj7…)',
    parentScale: 'Melodic Minor',
    degree: 'Im(maj7)',
  },
}


function useFlatsForScale(root, scaleName) {
  if (isFlat(root)) return true
  const offset = SCALE_PARENT_MAJOR_OFFSET[scaleName]
  if (offset === undefined) return false
  const rootIdx = noteToIndex(root)
  if (rootIdx === null) return false
  const parentIdx = ((rootIdx + offset) % 12 + 12) % 12
  
  return FLAT_MAJOR_KEYS.has(indexToNote(parentIdx, false))
      || FLAT_MAJOR_KEYS.has(indexToNote(parentIdx, true))
}


export const SCALES = {
  
  'Major':            { pattern: [0,2,4,5,7,9,11],       steps: 'W W H W W W H'        },
  'Natural Minor':    { pattern: [0,2,3,5,7,8,10],       steps: 'W H W W H W W'        },
  'Harmonic Minor':   { pattern: [0,2,3,5,7,8,11],       steps: 'W H W W H WH H'       },
  'Melodic Minor':    { pattern: [0,2,3,5,7,9,11],       steps: 'W H W W W W H'        },

  
  'Major Pentatonic': { pattern: [0,2,4,7,9],            steps: 'W W WH W WH',
    note: 'Formula: 1 2 3 5 6. C major pentatonic = A minor pentatonic (relative relationship).' },
  'Minor Pentatonic': { pattern: [0,3,5,7,10],           steps: 'WH W W WH W',
    note: 'Formula: 1 ♭3 4 5 ♭7. C minor pentatonic = Eb major pentatonic (relative relationship).' },

  
  'Blues Minor':      { pattern: [0,3,5,6,7,10],         steps: 'WH W H H WH W',
    note: 'Minor pentatonic + added ♭5 passing tone (formula: 1 ♭3 4 ♭5 5 ♭7). Also called simply "Blues scale".' },
  'Blues Major':      { pattern: [0,2,3,4,7,9],          steps: 'W H H WH W WH',
    note: 'Major pentatonic + added ♭3 passing tone (formula: 1 2 ♭3 3 5 6).' },

  
  'Dorian':           { pattern: [0,2,3,5,7,9,10],       steps: 'W H W W W H W'        },
  'Mixolydian':       { pattern: [0,2,4,5,7,9,10],       steps: 'W W H W W H W'        },
  'Phrygian':         { pattern: [0,1,3,5,7,8,10],       steps: 'H W W W H W W'        },

  
  'Bebop Major':      { pattern: [0,2,4,5,7,8,9,11],     steps: 'W W H W H H W H',
    passingToneIndex: 5,  ...BEBOP_SCALE_CONTEXT['Bebop Major'],
    note: 'Ionian + chromatic passing tone ♯5/♭6 between scale degrees 5 and 6 (8 notes).' },
  'Bebop Dominant':   { pattern: [0,2,4,5,7,9,10,11],    steps: 'W W H W W H H H',
    passingToneIndex: 7,  ...BEBOP_SCALE_CONTEXT['Bebop Dominant'],
    note: 'Mixolydian + natural 7 passing tone between ♭7 and the octave (8 notes).' },
  'Bebop Minor':      { pattern: [0,2,3,4,5,7,9,10],     steps: 'W H H H W W H W',
    passingToneIndex: 3,  ...BEBOP_SCALE_CONTEXT['Bebop Minor'],
    note: 'Dorian + natural 3 passing tone between ♭3 and 4 (8 notes).' },
  'Bebop Melodic Minor': { pattern: [0,2,3,5,7,8,9,11],  steps: 'W H W W H H W H',
    passingToneIndex: 5,  ...BEBOP_SCALE_CONTEXT['Bebop Melodic Minor'],
    note: 'Melodic Minor + ♭6 chromatic passing tone between 5 and ♮6 (8 notes). Fits over minor–major 7th chords.' },

  
  'Whole-Tone':             { pattern: [0,2,4,6,8,10],         steps: 'W W W W W W',
    note: 'All whole steps; only 2 unique transpositions exist. Used over augmented and dominant ♭5/♯5 chords.' },
  'Diminished (Half-Whole)': { pattern: [0,1,3,4,6,7,9,10],    steps: 'H W H W H W H W',
    note: 'Octatonic scale; alternating half-whole steps. Only 3 unique transpositions. Used over dominant 7th chords.' },
  'Diminished (Whole-Half)': { pattern: [0,2,3,5,6,8,9,11],    steps: 'W H W H W H W H',
    note: 'Octatonic scale; alternating whole-half steps. Only 3 unique transpositions. Used over diminished 7th chords.' },
}

export const SCALE_NAMES = Object.keys(SCALES)


export function getScaleNotes(root, scaleName) {
  const scale = SCALES[scaleName]
  if (!scale) throw new Error(`Unknown scale: "${scaleName}"`)
  const useFlats = useFlatsForScale(root, scaleName)
  return scale.pattern.map(offset => {
    
    if (scaleName === 'Harmonic Minor' && offset === 11) return transpose(root, offset, false)
    
    if (scaleName === 'Blues Major' && offset === 3) return transpose(root, offset, true)
    return transpose(root, offset, useFlats)
  })
}


export function getScalePattern(scaleName) {
  return SCALES[scaleName]?.steps ?? ''
}


export function randomScaleQuestion(scaleFilter) {
  const available = scaleFilter && scaleFilter.length > 0
    ? SCALE_NAMES.filter(n => scaleFilter.includes(n))
    : SCALE_NAMES

  if (available.length === 0) throw new Error('randomScaleQuestion: empty pool after filter')

  const scaleName = available[Math.floor(Math.random() * available.length)]
  const root      = randomNote()
  const notes     = getScaleNotes(root, scaleName)

  return { root, scaleName, notes, pattern: SCALES[scaleName].steps }
}


export function noteInScale(note, root, scaleName) {
  const notes = getScaleNotes(root, scaleName)
  const noteIdx  = noteToIndex(note)
  return notes.some(n => noteToIndex(n) === noteIdx)
}
