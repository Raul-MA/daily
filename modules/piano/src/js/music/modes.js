

import { transpose, isFlat } from './notes.js'
import { randomNote } from './notes.js'

export const MODES = [
  {
    name: 'Ionian',
    degree: 'I',
    pattern: [0, 2, 4, 5, 7, 9, 11],
    formula: '1 2 3 4 5 6 7',
    feel: 'Major / Happy',
    characteristic: 'Major scale — the reference mode; no characteristic passing tone',
    parentKeyDesc: 'IS the major scale; root and parent major key are the same.',
    jazzContext: 'Tonic major chords (IΔ7); the home-key sound.',
  },
  {
    name: 'Dorian',
    degree: 'ii',
    pattern: [0, 2, 3, 5, 7, 9, 10],
    formula: '1 2 ♭3 4 5 6 ♭7',
    feel: 'Minor / Cool',
    characteristic: 'Natural 6 — brighter than Aeolian despite sharing ♭3 and ♭7',
    parentKeyDesc: 'Parent major key is a whole step (M2) above the root — e.g., D Dorian → C major.',
    jazzContext: 'ii m7 chords in major-key ii–V–I progressions; tonic minor in modal jazz (e.g. "So What").',
  },
  {
    name: 'Phrygian',
    degree: 'iii',
    pattern: [0, 1, 3, 5, 7, 8, 10],
    formula: '1 ♭2 ♭3 4 5 ♭6 ♭7',
    feel: 'Minor / Dark / Spanish',
    characteristic: '♭2 — the defining Phrygian sound',
    parentKeyDesc: 'Parent major key is a major 3rd (M3) above the root — e.g., E Phrygian → C major.',
    jazzContext: 'iii m7 chords; also used in Spanish/Flamenco contexts and as a tense colour over altered dominants.',
  },
  {
    name: 'Lydian',
    degree: 'IV',
    pattern: [0, 2, 4, 6, 7, 9, 11],
    formula: '1 2 3 ♯4 5 6 7',
    feel: 'Major / Dreamy',
    characteristic: '♯4 — the Lydian sound',
    parentKeyDesc: 'Parent major key is a perfect 4th (P4) above the root — e.g., F Lydian → C major.',
    jazzContext: 'IVΔ7 and IΔ7 chords; the ♯4 avoids the tritone clash, making it favoured over major 7th chords.',
  },
  {
    name: 'Mixolydian',
    degree: 'V',
    pattern: [0, 2, 4, 5, 7, 9, 10],
    formula: '1 2 3 4 5 6 ♭7',
    feel: 'Dominant / Bluesy',
    characteristic: '♭7 — like major but with a lowered 7th',
    parentKeyDesc: 'Parent major key is a perfect 5th (P5) above the root — e.g., G Mixolydian → C major.',
    jazzContext: 'Dominant 7th chords (V7) in major-key ii–V–I progressions.',
  },
  {
    name: 'Aeolian',
    degree: 'vi',
    pattern: [0, 2, 3, 5, 7, 8, 10],
    formula: '1 2 ♭3 4 5 ♭6 ♭7',
    feel: 'Minor / Sad',
    characteristic: 'Natural minor scale — no single standout characteristic tone',
    parentKeyDesc: 'Parent major key is a minor 3rd (m3) above the root — e.g., A Aeolian → C major.',
    jazzContext: 'vi m7 chords in major key; tonic minor sound (natural minor).',
  },
  {
    name: 'Locrian',
    degree: 'vii',
    pattern: [0, 1, 3, 5, 6, 8, 10],
    formula: '1 ♭2 ♭3 4 ♭5 ♭6 ♭7',
    feel: 'Diminished / Tense',
    characteristic: '♭2 and ♭5 — the most dissonant mode',
    parentKeyDesc: 'Parent major key is a minor 2nd (m2) above the root — e.g., B Locrian → C major.',
    jazzContext: 'vii ø7 (half-diminished) chords; rarely used as a tonal centre due to the unstable ♭5.',
  },
]

export const MODE_NAMES = MODES.map(m => m.name)


export function getModeNotes(root, modeName) {
  const mode = MODES.find(m => m.name === modeName)
  if (!mode) throw new Error(`Unknown mode: "${modeName}"`)
  const useFlats = isFlat(root)
  return mode.pattern.map(offset => transpose(root, offset, useFlats))
}


export function randomModeQuestion(modeFilter) {
  const available = modeFilter && modeFilter.length > 0
    ? MODES.filter(m => modeFilter.includes(m.name))
    : MODES

  if (available.length === 0) throw new Error('randomModeQuestion: empty pool after filter')

  const mode  = available[Math.floor(Math.random() * available.length)]
  const root  = randomNote()
  const notes = getModeNotes(root, mode.name)

  return { root, mode, notes }
}
