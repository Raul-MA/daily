

import { transpose, isFlat } from './notes.js'
import { randomNote } from './notes.js'

export const MELODIC_MINOR_MODES = [
  {
    name: 'Melodic Minor',
    altNames: 'Jazz Minor · Ionian ♭3',
    degree: 'I',
    pattern: [0, 2, 3, 5, 7, 9, 11],
    formula: '1 2 ♭3 4 5 6 7',
    steps: 'W H W W W W H',
    chordFit: 'mMaj7',
    chordSymbol: 'Im∆7',
    feel: 'Minor with a bright leading tone',
    characteristic: 'Natural 6 and 7 over a minor chord — upper half is like a major scale',
    jazzContext: 'Tonic minor-major 7th chords (Im∆7). The foundational melodic minor sound in jazz; signals a tonal minor centre.',
    defaultUseFlats: true,
  },
  {
    name: 'Dorian ♭2',
    altNames: 'Phrygian ♯6 · Assyrian',
    degree: 'II',
    pattern: [0, 1, 3, 5, 7, 9, 10],
    formula: '1 ♭2 ♭3 4 5 6 ♭7',
    steps: 'H W W W W H W',
    chordFit: 'sus♭9',
    chordSymbol: 'IIsus♭9',
    feel: 'Dark / Phrygian flavour with a natural 6',
    characteristic: '♭2 with a natural 6 — Phrygian feeling but brighter than standard Phrygian',
    jazzContext: 'Suspended chords with ♭9 (sus♭9); IIsus colour in a ii–V context with altered dominant tension.',
    defaultUseFlats: true,
  },
  {
    name: 'Lydian Augmented',
    altNames: 'Lydian ♯5',
    degree: 'III',
    pattern: [0, 2, 4, 6, 8, 9, 11],
    formula: '1 2 3 ♯4 ♯5 6 7',
    steps: 'W W W W H W H',
    chordFit: 'Maj7♯5',
    chordSymbol: 'III∆7♯5',
    feel: 'Major / Dreamy / Floating',
    characteristic: '♯4 and ♯5 — Lydian with an augmented fifth; highly ambiguous tonally',
    jazzContext: 'Major 7th chords with an augmented 5th (∆7♯5 or Maj7+). The III chord in melodic minor harmony.',
    defaultUseFlats: false,
  },
  {
    name: 'Lydian Dominant',
    altNames: 'Lydian ♭7 · Acoustic Scale · Overtone Scale',
    degree: 'IV',
    pattern: [0, 2, 4, 6, 7, 9, 10],
    formula: '1 2 3 ♯4 5 6 ♭7',
    steps: 'W W W H W H W',
    chordFit: '7♯11',
    chordSymbol: 'IV7♯11',
    feel: 'Dominant / Bright / Open',
    characteristic: '♯4 and ♭7 together — Lydian plus a lowered 7th; the definitive tritone-sub or sub-V sound',
    jazzContext: 'Dominant 7th chords with ♯11 (7♯11). Tritone-substitution chords; IV dominant in melodic minor harmony.',
    defaultUseFlats: false,
  },
  {
    name: 'Mixolydian ♭6',
    altNames: 'Aeolian Dominant · Hindu Scale',
    degree: 'V',
    pattern: [0, 2, 4, 5, 7, 8, 10],
    formula: '1 2 3 4 5 ♭6 ♭7',
    steps: 'W W H W H W W',
    chordFit: '7♭13',
    chordSymbol: 'V7♭13',
    feel: 'Dominant / Dark / Descending',
    characteristic: '♭6 — natural major except for the lowered 6th; creates descending tension toward a minor tonic',
    jazzContext: 'Dominant chords resolving to a minor tonic (V7♭13 → im). The V7 in a minor-key ii–V–i.',
    defaultUseFlats: true,
  },
  {
    name: 'Locrian ♮2',
    altNames: 'Half-Diminished Scale · Aeolian ♭5',
    degree: 'VI',
    pattern: [0, 2, 3, 5, 6, 8, 10],
    formula: '1 2 ♭3 4 ♭5 ♭6 ♭7',
    steps: 'W H W H W W W',
    chordFit: 'ø7 (m7♭5)',
    chordSymbol: 'VIø7',
    feel: 'Diminished / Floating / Less tense than Locrian',
    characteristic: 'Natural 2 (♮2) instead of ♭2 — brighter and more musical than standard Locrian; ♭5 remains',
    jazzContext: 'Half-diminished chords (ø7, m7♭5). The ii chord in a minor-key ii–V–i (e.g. Dm7♭5 → G7alt → Cm).',
    defaultUseFlats: true,
  },
  {
    name: 'Altered Scale',
    altNames: 'Super Locrian · Diminished Whole-Tone',
    degree: 'VII',
    pattern: [0, 1, 3, 4, 6, 8, 10],
    
    
    formula: '1 ♭2 ♭3 ♮3 ♭5 ♭6 ♭7',
    steps: 'H W H W W W W',
    chordFit: '7alt',
    chordSymbol: 'VII7alt',
    feel: 'Maximum tension / Altered / Chromatic',
    characteristic: '♭2, ♭3 (=♯9), and ♭5 all present — every possible alteration of a dominant chord',
    jazzContext: 'Altered dominant chords (7alt, 7♭9♯9♭5♭13). The go-to scale for maximum tension before a tonic resolution.',
    defaultUseFlats: true,
  },
]

export const MELODIC_MINOR_MODE_NAMES = MELODIC_MINOR_MODES.map(m => m.name)


export function getMelodicMinorModeNotes(root, modeName) {
  const mode = MELODIC_MINOR_MODES.find(m => m.name === modeName)
  if (!mode) throw new Error(`Unknown melodic minor mode: "${modeName}"`)
  const useFlats = isFlat(root) || mode.defaultUseFlats
  return mode.pattern.map(offset => transpose(root, offset, useFlats))
}


export function randomMelodicMinorQuestion(modeFilter) {
  const available = modeFilter && modeFilter.length > 0
    ? MELODIC_MINOR_MODES.filter(m => modeFilter.includes(m.name))
    : MELODIC_MINOR_MODES

  if (available.length === 0) throw new Error('randomMelodicMinorQuestion: empty pool after filter')

  const mode  = available[Math.floor(Math.random() * available.length)]
  const root  = randomNote()
  const notes = getMelodicMinorModeNotes(root, mode.name)

  return { root, mode, notes }
}
