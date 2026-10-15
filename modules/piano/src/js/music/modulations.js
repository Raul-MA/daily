import { getKeyboardVoicing } from './notes.js'
import { getChordTones } from './chords.js'
import { getScaleNotes } from './scales.js'

const chordKeyboard = (root, type, label) => ({ ...getKeyboardVoicing(getChordTones(root, type), { root, startOctave: 4 }), label })
const scaleKeyboard = (root, scale, label) => ({ ...getKeyboardVoicing(getScaleNotes(root, scale).map(note => ({ note }))), label })



export const MODULATION_TYPES = [
  {
    id: 'diatonic',
    label: '5a',
    name: 'Diatonic (Pivot Chord) Modulation',
    description:
      'A chord common to both the old key and new key is reinterpreted to smooth the transition. ' +
      'The pivot chord belongs to both keys simultaneously.',
    example: {
      from: 'C major',
      to: 'G major',
      pivot: 'Am7',
      progression: 'Am7 → D7 – Gmaj7',
      table: [
        { chord: 'Am7', oldKey: 'vi in C', newKey: 'ii in G' },
        { chord: 'D7',  oldKey: '—',       newKey: 'V7 in G' },
        { chord: 'Gmaj7', oldKey: '—',     newKey: 'I in G'  },
      ],
    },
  },
  {
    id: 'direct',
    label: '5b',
    name: 'Direct (Phrase) Modulation',
    description:
      'The music moves abruptly to a new key with no common pivot chord. ' +
      'The new key simply begins — often at a phrase or section boundary.',
    example: {
      from: 'C major',
      to: 'D♭ major',
      progression: 'Cmaj7 ‖ D♭maj7',
      note: 'Common in semitone-up tags and codas.',
    },
  },
  {
    id: 'enharmonic',
    label: '5c',
    name: 'Enharmonic Modulation',
    description:
      'A chord is respelled enharmonically so it functions in a different key. ' +
      'The most common example uses a fully diminished 7th chord, which has four valid functional spellings.',
    example: {
      original: 'B – D – F – A♭  (vii°7 of C)',
      respelling: 'D – F – A♭ – C♭  (vii°7 of E♭)',
      target: 'Resolves to E♭ major',
      note: 'A fully diminished 7th chord has four functional spellings — three alternate respellings beyond the original.',
    },
  },
  {
    id: 'sequential',
    label: '5d',
    name: 'Sequential / Circle-of-Fifths Modulation',
    description:
      'Keys change through a chain of dominant motion or ii–V–I progressions, ' +
      'tonicizing successive key centres. Each new ii–V–I establishes a fresh tonic.',
    example: {
      progression: 'Em7 A7 | Dmaj7 ‖ Dm7 G7 | Cmaj7 ‖ Cm7 F7 | B♭maj7',
      note: 'Keys descend by whole step (D → C → B♭) via consecutive ii–V–I cadences.',
    },
  },
  {
    id: 'relative',
    label: '5e',
    name: 'Relative Key Modulation',
    description:
      'A shift between a major key and its relative minor (or vice versa). ' +
      'Both keys share the same key signature but have different tonal centres.',
    example: {
      from: 'C major',
      to: 'A minor',
      note: 'Same key signature (no sharps or flats); the tonal centre moves from C to A.',
    },
  },
  {
    id: 'parallel',
    label: '5f',
    name: 'Parallel Key Modulation',
    description:
      'A shift between major and minor built on the same tonic. ' +
      'The root stays the same but the modal colour — and key signature — changes.',
    example: {
      from: 'C major',
      to: 'C minor',
      note: 'Same root (C); the key signature and chord qualities change to reflect the parallel mode.',
    },
  },
]

export const MODULATION_QUESTIONS = [
  {
    id: 'pivot-1',
    keyboards: [chordKeyboard('A', 'm7', 'Am7: vi in C, ii in G'), chordKeyboard('D', '7', 'D7: dominant of G'), chordKeyboard('G', 'maj7', 'Gmaj7: new tonic')],
    type: 'diatonic',
    questionHTML: `
      <span class="label">Identify the modulation type</span>
      <span class="question">C major: … Am7 | D7 – Gmaj7</span>
      <span class="label">Which chord acts as the pivot?</span>
    `,
    answerHTML: `
      <span class="answer-label">Type</span>
      <span class="answer-main">Diatonic (Pivot Chord)</span>
      <span class="answer-sub">Pivot: Am7 — vi in C = ii in G</span>
      <span class="answer-sub">D7–Gmaj7 confirms G major as the new tonic.</span>
    `,
  },
  {
    id: 'direct-1',
    keyboards: [chordKeyboard('C', 'maj7', 'Cmaj7: original tonic'), chordKeyboard('Db', 'maj7', 'Dbmaj7: new tonic')],
    type: 'direct',
    questionHTML: `
      <span class="label">Identify the modulation type</span>
      <span class="question">Cmaj7 ‖ D♭maj7</span>
      <span class="label">Is there a pivot chord?</span>
    `,
    answerHTML: `
      <span class="answer-label">Type</span>
      <span class="answer-main">Direct (Phrase) Modulation</span>
      <span class="answer-sub">No pivot — the key jumps a semitone up abruptly.</span>
      <span class="answer-sub">Typical in semitone-up tags and codas.</span>
    `,
  },
  {
    id: 'enharmonic-1',
    keyboards: [chordKeyboard('B', 'dim7', 'B diminished seventh: leading-tone chord of C'), chordKeyboard('D', 'dim7', 'D diminished seventh: respelled leading-tone chord of Eb'), chordKeyboard('Eb', 'maj7', 'Ebmaj7: new tonic')],
    type: 'enharmonic',
    questionHTML: `
      <span class="label">Identify the modulation type</span>
      <span class="question">B°7 → (respelled) → E♭maj7</span>
      <span class="label">How does the diminished chord enable this shift?</span>
    `,
    answerHTML: `
      <span class="answer-label">Type</span>
      <span class="answer-main">Enharmonic Modulation</span>
      <span class="answer-sub">B–D–F–A♭ respelled as D–F–A♭–C♭ = vii°7 of E♭</span>
      <span class="answer-sub">The same pitch set is reinterpreted to function in E♭ major.</span>
    `,
  },
  {
    id: 'sequential-1',
    keyboards: [chordKeyboard('D', 'maj7', 'First tonal center: Dmaj7'), chordKeyboard('C', 'maj7', 'Second tonal center: Cmaj7'), chordKeyboard('Bb', 'maj7', 'Third tonal center: Bbmaj7')],
    type: 'sequential',
    questionHTML: `
      <span class="label">Identify the modulation type</span>
      <span class="question">Em7 A7 | Dmaj7 ‖ Dm7 G7 | Cmaj7 ‖ Cm7 F7 | B♭maj7</span>
      <span class="label">What drives the key changes here?</span>
    `,
    answerHTML: `
      <span class="answer-label">Type</span>
      <span class="answer-main">Sequential / Circle-of-Fifths</span>
      <span class="answer-sub">Each ii–V–I tonicizes a new root: D → C → B♭</span>
      <span class="answer-sub">Keys descend by whole step through dominant motion.</span>
    `,
  },
  {
    id: 'relative-1',
    keyboards: [scaleKeyboard('C', 'Major', 'C major: original tonal center'), scaleKeyboard('A', 'Natural Minor', 'A natural minor: same key signature, new tonal center')],
    type: 'relative',
    questionHTML: `
      <span class="label">Identify the modulation type</span>
      <span class="question">C major → tonal centre shifts to A minor</span>
      <span class="label">What do these two keys share?</span>
    `,
    answerHTML: `
      <span class="answer-label">Type</span>
      <span class="answer-main">Relative Key Modulation</span>
      <span class="answer-sub">Shared key signature (no sharps / flats)</span>
      <span class="answer-sub">The tonal centre moves from C to A; the notes stay the same.</span>
    `,
  },
  {
    id: 'parallel-1',
    keyboards: [chordKeyboard('C', 'maj7', 'Cmaj7: major tonic'), chordKeyboard('C', 'm7', 'Cm7: minor tonic'), chordKeyboard('C', 'mMaj7', 'CmMaj7: alternative minor tonic')],
    type: 'parallel',
    questionHTML: `
      <span class="label">Identify the modulation type</span>
      <span class="question">Cmaj7 → Cm7 (or CmMaj7)</span>
      <span class="label">What stays the same? What changes?</span>
    `,
    answerHTML: `
      <span class="answer-label">Type</span>
      <span class="answer-main">Parallel Key Modulation</span>
      <span class="answer-sub">Same root (C); mode changes from major to minor</span>
      <span class="answer-sub">The key signature and chord qualities change; the tonic pitch does not.</span>
    `,
  },
  {
    id: 'pivot-2',
    keyboards: [chordKeyboard('B', 'm7', 'Bm7: iii in G, ii in A'), chordKeyboard('E', '7', 'E7: dominant of A'), chordKeyboard('A', 'maj7', 'Amaj7: new tonic')],
    type: 'diatonic',
    questionHTML: `
      <span class="label">Identify the modulation type</span>
      <span class="question">G major: … Bm7 | E7 – Amaj7</span>
      <span class="label">Which chord is shared between both keys?</span>
    `,
    answerHTML: `
      <span class="answer-label">Type</span>
      <span class="answer-main">Diatonic (Pivot Chord)</span>
      <span class="answer-sub">Pivot: Bm7 — iii in G = ii in A</span>
      <span class="answer-sub">E7–Amaj7 confirms A major as the new tonic.</span>
    `,
  },
  {
    id: 'direct-2',
    keyboards: [chordKeyboard('F', 'maj7', 'Fmaj7: original tonic'), chordKeyboard('Gb', 'maj7', 'Gbmaj7: new tonic')],
    type: 'direct',
    questionHTML: `
      <span class="label">Identify the modulation type</span>
      <span class="question">Fmaj7 ‖ G♭maj7 (no common chord)</span>
      <span class="label">Is there any preparation for the new key?</span>
    `,
    answerHTML: `
      <span class="answer-label">Type</span>
      <span class="answer-main">Direct (Phrase) Modulation</span>
      <span class="answer-sub">No pivot — abrupt shift up a semitone</span>
      <span class="answer-sub">The new key starts without transition at the phrase boundary.</span>
    `,
  },
]
