

import { CHROMATIC_FLATS, transpose, isFlat } from './notes.js'
import { getScaleNotes } from './scales.js'
import { getChordNotes, formatChordName } from './chords.js'


export const IIVI_KEYS = CHROMATIC_FLATS


export const SCALE_HARMONY = {
  'Major': [
    { roman: 'I',    chordType: 'maj7' },
    { roman: 'ii',   chordType: 'm7'   },
    { roman: 'iii',  chordType: 'm7'   },
    { roman: 'IV',   chordType: 'maj7' },
    { roman: 'V',    chordType: '7'    },
    { roman: 'vi',   chordType: 'm7'   },
    { roman: 'vii°', chordType: 'm7b5' },
  ],
  'Natural Minor': [
    { roman: 'i',    chordType: 'm7'   },
    { roman: 'ii°',  chordType: 'm7b5' },
    { roman: 'III',  chordType: 'maj7' },
    { roman: 'iv',   chordType: 'm7'   },
    { roman: 'v',    chordType: 'm7'   },
    { roman: 'VI',   chordType: 'maj7' },
    { roman: 'VII',  chordType: '7'    },
  ],
  'Harmonic Minor': [
    { roman: 'i',    chordType: 'mMaj7' },
    { roman: 'ii°',  chordType: 'm7b5'  },
    { roman: 'III+', chordType: 'augMaj7' },
    { roman: 'iv',   chordType: 'm7'    },
    { roman: 'V',    chordType: '7'     },
    { roman: 'VI',   chordType: 'maj7'  },
    { roman: 'vii°', chordType: 'dim7'  },
  ],
  'Melodic Minor': [
    { roman: 'i',    chordType: 'mMaj7' },
    { roman: 'ii',   chordType: 'm7'    },
    { roman: 'III+', chordType: 'augMaj7' },
    { roman: 'IV',   chordType: '7'     },
    { roman: 'V',    chordType: '7'     },
    { roman: 'vi°',  chordType: 'm7b5'  },
    { roman: 'vii°', chordType: 'm7b5'  },
  ],
}

export const PROGRESSION_SCALE_NAMES = Object.keys(SCALE_HARMONY)


export function generateProgression(root, scaleName, length = 4) {
  const harmony = SCALE_HARMONY[scaleName]
  if (!harmony) throw new Error(`Unknown scale for progression: "${scaleName}"`)

  const scaleNotes = getScaleNotes(root, scaleName)

  
  const degreeCount = harmony.length
  const indices = shuffleArray([...Array(degreeCount).keys()]).slice(0, Math.min(length, degreeCount))

  return indices.map(i => {
    const degree    = harmony[i]
    const chordRoot = scaleNotes[i]
    const chordName = formatChordName(chordRoot, degree.chordType)
    const notes     = getChordNotes(chordRoot, degree.chordType)
    return {
      roman:     degree.roman,
      chordType: degree.chordType,
      chordName,
      root:      chordRoot,
      notes,
    }
  })
}

function shuffleArray(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}


export function buildIIVI(root, mode = 'major') {
  if (mode === 'major') {
    const scaleNotes = getScaleNotes(root, 'Major')
    return [
      {
        roman:     'iim7',
        chordType: 'm7',
        chordName: formatChordName(scaleNotes[1], 'm7'),
        root:      scaleNotes[1],
        notes:     getChordNotes(scaleNotes[1], 'm7'),
      },
      {
        roman:     'V7',
        chordType: '7',
        chordName: formatChordName(scaleNotes[4], '7'),
        root:      scaleNotes[4],
        notes:     getChordNotes(scaleNotes[4], '7'),
      },
      {
        roman:     'Imaj7',
        chordType: 'maj7',
        chordName: formatChordName(root, 'maj7'),
        root,
        notes:     getChordNotes(root, 'maj7'),
      },
    ]
  }

  if (mode === 'minor') {
    
    const scaleNotes = getScaleNotes(root, 'Harmonic Minor')
    const vRoot = scaleNotes[4]
    
    const b9 = transpose(vRoot, 1, isFlat(vRoot))
    return [
      {
        roman:     'iiø7',
        chordType: 'm7b5',
        chordName: formatChordName(scaleNotes[1], 'm7b5'),
        root:      scaleNotes[1],
        notes:     getChordNotes(scaleNotes[1], 'm7b5'),
      },
      {
        roman:     'V7(♭9)',
        chordType: '7',
        chordName: formatChordName(vRoot, '7') + '(♭9)',
        root:      vRoot,
        notes:     getChordNotes(vRoot, '7'),
        b9,
      },
      {
        roman:     'imMaj7',
        chordType: 'mMaj7',
        chordName: formatChordName(root, 'mMaj7'),
        root,
        notes:     getChordNotes(root, 'mMaj7'),
      },
    ]
  }

  throw new Error(`Unknown mode: "${mode}"`)
}


export function randomIIVIQuestion(filterModes) {
  const modes = filterModes && filterModes.length > 0
    ? filterModes.filter(m => m === 'major' || m === 'minor')
    : ['major', 'minor']
  if (modes.length === 0) return randomIIVIQuestion(null)

  const root = IIVI_KEYS[Math.floor(Math.random() * IIVI_KEYS.length)]
  const mode = modes[Math.floor(Math.random() * modes.length)]
  return { root, mode, chords: buildIIVI(root, mode) }
}
