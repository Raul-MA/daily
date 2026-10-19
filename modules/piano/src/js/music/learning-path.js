
import { randomNote, spellInterval } from './notes.js'
import { randomInterval } from './intervals.js'
import { getChordTones, getAvailableTensionNotes, formatChordName, randomChordDegreeQuestion } from './chords.js'
import { buildIIVI } from './progressions.js'
import { GUIDE_TONE_PROGRESSIONS, computeGuideTonesMotion } from './voice-leading.js'
import { getScaleNotes } from './scales.js'

const chordTones = (root, type) => getChordTones(root, type)
const naturalNinth = (root, type) => {
  const tone = getAvailableTensionNotes(root, type).find(item => item.degree === '9')
  return { ...tone, semitones: tone.semitones + 12 }
}
const reference = (label, path) => ({ label, path })
const intervalsLink = reference('Interval reference', '/intervals/theory')
const chordsLink = reference('Chord tones practice', '/tensions/exercises')
const guideLink = reference('Guide-tone practice', '/voice-leading/exercises')

function progressionSteps(root, mode = 'major') {
  return buildIIVI(root, mode).map((chord, index) => ({
    label: chord.chordName,
    instruction: `Spend four slow counts on ${chord.chordName}. ${index === 2 ? 'Let your phrase come to rest.' : 'Leave space before the next chord.'} Start with a chord tone; optional left hand: the root alone.`,
    keyboard: { root: chord.root, tones: chordTones(chord.root, chord.chordType) },
  }))
}

const bluesRoots = ['C', 'C', 'C', 'C', 'F', 'F', 'C', 'C', 'G', 'F', 'C', 'G']
const bluesSteps = bluesRoots.map((root, index) => ({
  label: `Bar ${index + 1}: ${formatChordName(root, '7')}`,
  instruction: 'Count four steady beats. Play or name a short chord-tone phrase, then leave a rest.',
  keyboard: { root, tones: chordTones(root, '7') },
}))

export const LESSONS = [
  {
    id: 'interval-foundations', stage: 1, title: 'Find thirds and fifths',
    objective: 'Name and locate a few useful intervals without counting every key.',
    prerequisite: null, roots: ['C'],
    explanation: 'An interval describes the distance between two notes. A major third spans four semitones, a minor third three, and a perfect fifth seven. Count letter names as well: a third from C must be some kind of E. Start slowly, say both notes, and notice the keyboard shape. Speed can come later.',
    recall: { kind: 'interval', semitones: [3, 4, 7] },
    application: {
      piano: 'From C, play C–E, C–Eb, and C–G. Say major third, minor third, and perfect fifth. Choose one pair, repeat a two-note rhythm twice, then leave a full beat of silence. Repeat in another octave when comfortable.',
      away: 'Picture C on the keyboard. Name its major third, minor third, and fifth. Tap a two-note rhythm and say the two note names in that rhythm; repeat and leave a beat of silence.',
      example: 'C–E, C–E, rest. E is the major third above C. Change E to Eb to hear or imagine a minor color. This is one possible phrase, not a required answer.',
      keyboard: { root: 'C', tones: [chordTones('C', 'maj7')[0], chordTones('C', 'maj7')[1]] },
    },
    selfChecks: ['Can I name a third without counting every semitone?', 'Can I locate both notes, or describe their keyboard positions?', 'Did I repeat a rhythm and leave space?'],
    links: [intervalsLink],
  },
  {
    id: 'seventh-intervals', stage: 1, title: 'Hear and find sevenths',
    objective: 'Distinguish major and minor sevenths and find intervals in both directions.',
    prerequisite: 'interval-foundations', roots: ['C', 'D', 'G'],
    explanation: 'A major seventh is one semitone below the next root; a minor seventh is two below it. From C these are B and Bb. The letter distance still matters: both are sevenths. Naming the relationship in reverse helps connect a note to its role instead of memorizing only one question format.',
    recall: { kind: 'interval', semitones: [10, 11] },
    application: {
      piano: 'Play C and the C one octave higher. Move the upper note down to B, then Bb. Say each interval from the lower C. Make a short phrase C–G–B, then C–G–Bb, leaving a rest after each.',
      away: 'Imagine the C octave. Name the note one semitone below the upper C, then two below. Say which interval each forms above the lower C. Plan two short phrases that differ only in their seventh.',
      example: 'C–G–B suggests a major seventh color; C–G–Bb uses a minor seventh. Use the same rhythm for both so the changed note stands out.',
      keyboard: { root: 'C', tones: chordTones('C', '7').filter(tone => ['1', '5', '♭7'].includes(tone.degree)) },
    },
    selfChecks: ['Can I distinguish B from Bb above C?', 'Can I locate a seventh using the octave as a landmark?'],
    links: [intervalsLink, chordsLink],
  },
  {
    id: 'chord-tone-fluency', stage: 2, title: 'Turn chord symbols into notes',
    objective: 'Recall individual chord tones and use them in a short phrase.',
    prerequisite: 'seventh-intervals', roots: ['C', 'D', 'G'],
    explanation: 'A major triad uses 1, 3, 5; a minor triad lowers the third. Add a seventh: maj7 has a major third and major seventh; m7 has a minor third and minor seventh; dominant 7 has a major third and minor seventh. For example Cmaj7 is C–E–G–B, Dm7 is D–F–A–C, and G7 is G–B–D–F. Build slowly before asking for quick recall.',
    recall: { kind: 'chord', chordTypes: ['maj7', 'm7', '7'], degrees: ['1', '3', '♭3', '5', '7', '♭7'] },
    application: {
      piano: 'Play D–F–A as a broken minor triad, then add C to make Dm7. Improvise with just those four notes. Play two or three notes, repeat your rhythm, then rest. Optional left hand: hold D.',
      away: 'Name the D minor triad, then add its seventh. Choose three Dm7 notes, tap a rhythm, and say the notes with a rest at the end. Explain each note’s role.',
      example: 'F–A–C, rest, F–A–D, rest. Both phrases use only Dm7 chord tones; changing the last note develops the first idea.',
      keyboard: { root: 'D', tones: chordTones('D', 'm7') },
    },
    selfChecks: ['Can I explain the difference between maj7, m7, and 7?', 'Did every note in my phrase belong to Dm7?', 'Can I name the third and seventh before playing the whole chord?'],
    links: [chordsLink, reference('Chord reference', '/tensions/theory')],
  },
  {
    id: 'rhythm-and-motif', stage: 3, title: 'Make a phrase with rhythm and space',
    objective: 'Develop a small musical idea through repetition and one deliberate change.',
    prerequisite: 'chord-tone-fluency', roots: ['D'],
    explanation: 'A motif is a small idea you can recognize when it returns. You do not need a new scale to make one. Use Dm7 chord tones, keep a steady count of four, repeat a rhythm, and leave silence. Change only the last note or the starting beat on the next repetition. The prompt timer gives practice time; it is not a metronome.',
    recall: { kind: 'creative' },
    application: {
      piano: 'Count 1–2–3–4 slowly. Play F on beat 1, A on beat 2, and rest on beats 3–4. Repeat once, then change A to C. Continue with your own two-note motif while keeping the rests.',
      away: 'Tap four steady beats. Say F on 1 and A on 2, staying silent on 3–4. Repeat, then replace A with C. Invent another rhythm and say which part you kept and which you changed.',
      example: 'Bar 1: F, A, rest, rest. Bar 2: F, A, rest, rest. Bar 3: F, C, rest, rest. The repeated rhythm connects the phrases; the last note creates variety.',
      keyboard: { root: 'D', tones: chordTones('D', 'm7') },
    },
    selfChecks: ['Did I keep a steady count?', 'Could I recognize my repeated idea?', 'Did I leave silence and change only one feature at a time?'],
    links: [chordsLink],
  },
  {
    id: 'major-changes', stage: 4, title: 'Follow a major ii–V–I',
    objective: 'Choose nearby target notes as the harmony changes.',
    prerequisite: 'rhythm-and-motif', roots: ['C'],
    explanation: 'In C major, ii–V–I is Dm7–G7–Cmaj7. Thirds and sevenths describe the chord clearly. F is the third of Dm7 and the seventh of G7, then moves down a semitone to E, the third of Cmaj7. Start by playing this target line alone, then add a few notes around it. The scale is familiar, but the landing notes now follow the harmony.',
    recall: { kind: 'progression', mode: 'major' },
    application: {
      piano: 'Give each chord four slow counts. Play F over Dm7, keep F over G7, then land on E over Cmaj7. Repeat, adding one or two chord tones before each target. Optional left hand: D, G, C roots. Advance the chord cards manually or set a comfortable dwell time.',
      away: 'Name the role of F over Dm7 and G7, then E over Cmaj7. Tap four counts per chord. Plan a short phrase for each chord that ends or begins on its target.',
      example: 'Dm7: F–A–C–F. G7: F–D–B–F. Cmaj7: E, then rest. F stays common through the first change and resolves down to E at the tonic.',
      keyboard: { root: 'D', tones: chordTones('D', 'm7') }, sequence: progressionSteps('C'),
    },
    selfChecks: ['Did I know which chord I was on?', 'Did F change role when Dm7 became G7?', 'Did I land on E when Cmaj7 arrived?'],
    links: [guideLink, reference('ii–V–I practice', '/iivi/exercises')],
  },
  {
    id: 'passing-notes-and-ninths', stage: 5, title: 'Add a passing note and a ninth',
    objective: 'Add color while keeping clear chord-tone destinations.',
    prerequisite: 'major-changes', roots: ['C', 'D', 'G'],
    explanation: 'A passing note connects two more stable notes by step. Over Cmaj7, D can connect C to E. D is also the ninth of C: the second degree carried into the next octave. A note’s effect depends on rhythm and context. First use D briefly between chord tones, then hold it to explore its color and resolve to E or C.',
    recall: { kind: 'ninth' },
    application: {
      piano: 'Over Cmaj7, play C–D–E with D between the two chord tones. Repeat your rhythm. Next hold D a little longer, then resolve to E. Keep most of your phrase on chord tones; add only this one color note at first.',
      away: 'Name the chord tones and passing note in C–D–E over Cmaj7. Explain why D can also be called a ninth. Tap one version with a quick D and another with a held D, then name a resolution.',
      example: 'C–D–E, rest; G–D–E, rest. In the first phrase D passes between C and E. In the second it is a color note that resolves to E.',
      keyboard: { root: 'C', tones: [...chordTones('C', 'maj7'), naturalNinth('C', 'maj7')] },
    },
    selfChecks: ['Can I identify the chord-tone destination?', 'Can I name the ninth without rebuilding the entire chord?', 'Did the added note support my phrase?'],
    links: [reference('Available tensions', '/available-tensions/theory'), reference('Extended chord practice', '/extended-chords/exercises')],
  },
  {
    id: 'transfer-to-new-keys', stage: 6, title: 'Move the same idea into F, G, and Bb',
    objective: 'Keep a phrase’s chord roles and rhythm when its note names change.',
    prerequisite: 'passing-notes-and-ninths', roots: ['F', 'G', 'Bb'],
    explanation: 'Transposing means preserving relationships in a new key. Take the third–seventh–third target line from ii–V–I in C and move it to F: Bb over Gm7, Bb over C7, A over Fmaj7. Keep the rhythm unchanged. Work in F first; repeat in G and then Bb after you can name the chords and targets slowly.',
    recall: { kind: 'progression', mode: 'major' },
    application: {
      piano: 'Practice the F-key cards first, four counts per chord. Target Bb–Bb–A. Then repeat the same idea in G (C–C–B) and Bb (Eb–Eb–D). If finding notes breaks your pulse, stop and name the notes before restarting.',
      away: 'Write or say the ii–V–I chords and target line in F. Explain the role of each target. Repeat in G and Bb while tapping the same rhythm.',
      example: 'F: Gm7–C7–Fmaj7, targets Bb–Bb–A. G: Am7–D7–Gmaj7, targets C–C–B. Bb: Cm7–F7–Bbmaj7, targets Eb–Eb–D.',
      keyboard: { root: 'G', tones: chordTones('G', 'm7') },
      sequence: ['F', 'G', 'Bb'].flatMap(root => progressionSteps(root).map(step => ({ ...step, label: `Key ${root}: ${step.label}` }))),
    },
    selfChecks: ['Did I keep the same rhythm in the new key?', 'Can I name the target’s role rather than only its letter?', 'Which key needs another slow repetition?'],
    links: [guideLink, reference('Key signatures', '/key-signatures/exercises')],
  },
  {
    id: 'blues-form', stage: 6, title: 'Keep your place in a twelve-bar blues',
    objective: 'Carry a short motif through a complete repeating form.',
    prerequisite: 'transfer-to-new-keys', roots: ['C', 'F', 'G'],
    explanation: 'A simple blues in C uses dominant seventh chords on I, IV, and V: C7, F7, and G7. This version is C7 for four bars, F7 for two, C7 for two, then G7, F7, C7, G7. Each bar has four beats. Count the bars as well as the beats. Begin with chord tones; the blues scale can be explored later as an expressive color.',
    recall: { kind: 'blues' },
    application: {
      piano: 'Follow the twelve cards in order, four beats each. Play one short chord-tone motif, answer it with a small variation, and rest. Aim at the third when the chord changes: E for C7, A for F7, B for G7. Repeat the whole form.',
      away: 'Count twelve bars of four beats. Name the chord at each bar, using the cards to check. Say its third when the harmony changes, and tap a repeated call-and-response rhythm.',
      example: 'Over C7, play E–G then rest. Over F7, answer A–C then rest. Over G7, use B–D. The shape and rhythm repeat while the chord tones change.',
      keyboard: { root: 'C', tones: chordTones('C', '7') }, sequence: bluesSteps,
    },
    selfChecks: ['Could I return to bar 1 without losing the form?', 'Did I notice the change to F7 at bar 5?', 'Did I repeat an idea instead of filling every beat?'],
    links: [reference('Chord progressions', '/chord-progressions/theory'), reference('Blues scales reference', '/scales/theory')],
  },
  {
    id: 'minor-changes', stage: 6, title: 'Resolve a minor ii–V–i',
    objective: 'Use a raised leading tone to resolve into a minor tonic.',
    prerequisite: 'blues-form', roots: ['C'],
    explanation: 'In C minor, practice Dø7–G7(♭9)–CmMaj7. Dø7 means half-diminished: D–F–Ab–C. G7 supplies B natural, which leads up to C; its optional flat ninth is Ab. CmMaj7 contains C–Eb–G–B. This is one common minor-tonic color, not the only possible minor ending. Begin with the three-note target line F–F–Eb before adding color.',
    recall: { kind: 'progression', mode: 'minor' },
    application: {
      piano: 'Give each chord four counts. Play F over Dø7, F over G7, then Eb over CmMaj7. Next try C over Dø7, B over G7, and C at the tonic. Add Ab over G7 only after the basic line feels clear.',
      away: 'Name the notes of Dø7 and identify what changed from Dm7. Explain why B natural in G7 leads to C. Plan a phrase that lands on Eb or C over the tonic.',
      example: 'Dø7: F–Ab–C. G7: B–D–F. CmMaj7: Eb–C, rest. Another target line is C–B–C: the dominant’s B rises by a semitone into the tonic.',
      keyboard: { root: 'D', tones: chordTones('D', 'm7b5') }, sequence: progressionSteps('C', 'minor'),
    },
    selfChecks: ['Did I use Ab in Dø7?', 'Can I explain B natural over G7 in C minor?', 'Did my final phrase settle on a tonic chord tone?'],
    links: [reference('Minor ii–V–I practice', '/iivi/exercises'), reference('Minor scale reference', '/scales/theory')],
  },
  {
    id: 'dorian-color', stage: 6, title: 'Explore one modal color deliberately',
    objective: 'Hear or imagine the natural sixth over a minor chord without abandoning phrasing.',
    prerequisite: 'minor-changes', roots: ['D'],
    explanation: 'D Dorian uses D–E–F–G–A–B–C. It shares its notes with C major, but D is the center here. Its B natural is a major sixth above D, contrasting with Bb in D natural minor. Sustain Dm7, keep the chord tones as landmarks, and introduce B as one chosen color. A mode is useful when you can hear or imagine what its distinctive note does.',
    recall: { kind: 'modal' },
    application: {
      piano: 'Hold or repeat D in the left hand if comfortable. Play a short Dm7 chord-tone motif, then add B and resolve to A. Compare a phrase with Bb instead; return to B and notice the different color. Keep rests and a repeated rhythm.',
      away: 'Compare D Dorian with D natural minor. Name the changed note and its interval above D. Plan a short Dm7 phrase containing B, and choose a chord tone to resolve to.',
      example: 'F–A–B–A, rest; F–A–C–A, rest. B is Dorian’s natural sixth; A is the fifth of Dm7. The repeated shape makes the color note part of a phrase.',
      keyboard: { tones: getScaleNotes('D', 'Dorian').map((note, index) => ({ note, degree: ['1', '2', '♭3', '4', '5', '6', '♭7'][index] })) },
    },
    selfChecks: ['Can I distinguish Dorian’s B from natural minor’s Bb?', 'Did I preserve a recognizable motif?', 'Can I describe the color note’s role and resolution?'],
    links: [reference('Modes reference', '/modes/theory'), reference('Modal color practice', '/modal-characteristics/exercises')],
  },
]


const promptCreators = { interval: intervalPrompt, chord: chordPrompt, progression: progressionPrompt, ninth: ninthPrompt, blues: bluesPrompt, modal: modalPrompt };
export function createRecallPrompt(lesson, index = 0) {
 const kind = lesson.recall.kind;
 const create = Object.hasOwn(promptCreators, kind) ? promptCreators[kind] : creativePrompt;
 return create(lesson, index);
}
function intervalPrompt(lesson, index) {
const config = lesson.recall

    const root = randomNote(lesson.roots)
    const interval = randomInterval(config.semitones)
    const degree = Number(interval.abbr.slice(1))
    const result = spellInterval(root, interval.semitones, degree)
    const tones = [{ note: root, degree: 'start', semitones: 0 }, { note: result, degree: interval.abbr, semitones: interval.semitones }]
    if (index % 3 === 1) return { question: `What interval goes up from ${root} to ${result}?`, answer: `${interval.name}: ${interval.semitones} semitones.`, keyboard: { root, tones } }
    if (index % 3 === 2) return { question: `Starting on ${result}, go down a ${interval.name.toLowerCase()}. Which note do you reach?`, answer: `${root}. Reverse the ${root}–${result} interval; choose the ${root} below ${result}.`, keyboard: { root, tones } }
    return { question: `What note is a ${interval.name.toLowerCase()} above ${root}? Name it and locate its piano key.`, answer: `${result}, ${interval.semitones} semitones above ${root}.`, keyboard: { root, tones } }
  
}

function chordPrompt(lesson, index) {
const config = lesson.recall

    const prompt = randomChordDegreeQuestion({ roots: lesson.roots, types: config.chordTypes, degrees: config.degrees, reverse: index % 2 === 1 })
    return {
      question: prompt.reverse ? `What degree is ${prompt.note} in ${prompt.name}?` : `What is degree ${prompt.degree} of ${prompt.name}? Name it and locate it.`,
      answer: `${prompt.note} is degree ${prompt.degree} of ${prompt.name}.`,
      keyboard: { root: prompt.root, tones: prompt.tones },
    }
  
}

function progressionPrompt(lesson, index) {
const config = lesson.recall

    const key = lesson.roots[Math.floor(index / 3) % lesson.roots.length]
    const chords = buildIIVI(key, config.mode)
    const position = index % 3
    const chord = chords[position]
    const target = getChordTones(chord.root, chord.chordType)[position === 1 ? 3 : 1]
    let connection = ''
    if (config.mode === 'major' && position < 2) {
      const next = chords[position + 1]
      const rule = GUIDE_TONE_PROGRESSIONS[position]
      const motion = computeGuideTonesMotion({ root: chord.root, type: chord.chordType }, { root: next.root, type: next.chordType }, rule.resolutions)[position === 0 ? 0 : 1]
      connection = ` Toward ${next.chordName}: ${motion.fromNote} → ${motion.toNote}, ${motion.motion}.`
    }
    return {
      question: `Key ${key} ${config.mode}: ${chords.map(item => item.chordName).join(' → ')}. Name degree ${target.degree} of ${chord.chordName}.`,
      answer: `${target.note} is degree ${target.degree} of ${chord.chordName}.${connection}`,
      keyboard: { root: chord.root, tones: chordTones(chord.root, chord.chordType) },
    }
  
}

function ninthPrompt(lesson) {

    const root = randomNote(lesson.roots)
    const type = { C: 'maj7', D: 'm7', G: '7' }[root]
    const ninth = naturalNinth(root, type)
    return { question: `What is the natural ninth of ${formatChordName(root, type)}?`, answer: `${ninth.note}. It shares a note name with the second above ${root}; the ninth is an octave higher.`, keyboard: { root, tones: [{ note: root, degree: '1', semitones: 0 }, ninth] } }
  
}

function bluesPrompt(lesson, index) {

    const bar = index % bluesSteps.length
    const root = bluesRoots[bar]
    const third = chordTones(root, '7')[1]
    return { question: `C blues, bar ${bar + 1}: which chord comes here, and what is its third?`, answer: `${formatChordName(root, '7')}; its third is ${third.note}. Count four beats before the next bar.`, keyboard: bluesSteps[bar].keyboard }
  
}

function modalPrompt(lesson) {

    const dorian = getScaleNotes('D', 'Dorian')
    const minor = getScaleNotes('D', 'Natural Minor')
    return { question: 'Which note distinguishes D Dorian from D natural minor? Name its role over D.', answer: `${dorian[5]} is the natural sixth; D natural minor has ${minor[5]}, the flat sixth. Try resolving ${dorian[5]} to ${dorian[4]}.`, keyboard: lesson.application.keyboard }
  
}

function creativePrompt(lesson) {
return { question: 'Create a two-note Dm7 motif, repeat its rhythm, then change one note. Leave two beats of silence.', answer: lesson.application.example, keyboard: lesson.application.keyboard, example: true }
}
