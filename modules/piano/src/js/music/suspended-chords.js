import { transpose, isFlat, randomNote } from './notes.js'

export const SUSPENDED_CHORD_TYPES = {
  sus2: {
    symbol: 'sus2',
    fullName: 'Suspended 2nd',
    degrees: ['1', '2', '5'],
    intervals: [0, 2, 7],
    resolvesTo: 'major',
  },
  sus4: {
    symbol: 'sus4',
    fullName: 'Suspended 4th',
    degrees: ['1', '4', '5'],
    intervals: [0, 5, 7],
    resolvesTo: 'major',
  },
  '7sus4': {
    symbol: '7sus4',
    fullName: 'Dominant 7 Suspended 4th',
    degrees: ['1', '4', '5', '♭7'],
    intervals: [0, 5, 7, 10],
    resolvesTo: '7',
  },
  '9sus4': {
    symbol: '9sus4',
    fullName: 'Dominant 9 Suspended 4th',
    degrees: ['1', '4', '5', '♭7', '9'],
    intervals: [0, 5, 7, 10, 14],
    resolvesTo: '9',
  },
}

export const SUSPENDED_CHORD_TYPE_KEYS = Object.keys(SUSPENDED_CHORD_TYPES)

export function getSuspendedChordTones(root, type) {
  const chord = SUSPENDED_CHORD_TYPES[type]
  if (!chord) throw new Error(`Unknown suspended chord type: "${type}"`)
  const useFlats = isFlat(root)
  return chord.intervals.map((semitones, i) => ({
    degree: chord.degrees[i],
    note: transpose(root, semitones, useFlats),
    semitones,
  }))
}

export function formatSuspendedChordName(root, type) {
  const chord = SUSPENDED_CHORD_TYPES[type]
  if (!chord) return `${root}${type}`
  return `${root}${chord.symbol}`
}

function shuffleArray(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pickType(typeFilter) {
  const available = typeFilter && typeFilter.length > 0
    ? SUSPENDED_CHORD_TYPE_KEYS.filter(t => typeFilter.includes(t))
    : SUSPENDED_CHORD_TYPE_KEYS
  if (available.length === 0) throw new Error('Suspended chord pool is empty after filtering')
  return available[Math.floor(Math.random() * available.length)]
}

export function randomSuspendedSpellQuestion(typeFilter) {
  const type = pickType(typeFilter)
  const root = randomNote()
  const tones = getSuspendedChordTones(root, type)
  return {
    mode: 'spell',
    root,
    type,
    chordName: formatSuspendedChordName(root, type),
    tones,
  }
}

export function randomSuspendedIdentifyQuestion(typeFilter) {
  const type = pickType(typeFilter)
  const root = randomNote()
  const tones = getSuspendedChordTones(root, type)
  const shuffledNotes = shuffleArray(tones.map(t => t.note))
  return {
    mode: 'identify',
    root,
    type,
    chordName: formatSuspendedChordName(root, type),
    tones,
    shuffledNotes,
  }
}

export function getSuspendedResolution(root, type) {
  const tones = getSuspendedChordTones(root, type)
  const chord = SUSPENDED_CHORD_TYPES[type]
  const useFlats = isFlat(root)

  const resolutionMoves = []
  if (chord.degrees.includes('4')) {
    resolutionMoves.push({
      fromDegree: '4',
      fromNote: transpose(root, 5, useFlats),
      toDegree: '3',
      toNote: transpose(root, 4, useFlats),
      toSemitones: 4,
      motion: 'down a semitone',
    })
  }
  if (chord.degrees.includes('2')) {
    resolutionMoves.push({
      fromDegree: '2',
      fromNote: transpose(root, 2, useFlats),
      toDegree: '3',
      toNote: transpose(root, 4, useFlats),
      toSemitones: 4,
      motion: 'up a whole step',
    })
  }

  const resolvedTones = tones.map(tone => {
    const move = resolutionMoves.find(item => item.fromDegree === tone.degree)
    return move ? { ...tone, note: move.toNote, degree: move.toDegree, semitones: move.toSemitones } : { ...tone }
  })

  return {
    mode: 'resolve',
    root,
    type,
    chordName: formatSuspendedChordName(root, type),
    tones,
    resolutionTarget: chord.resolvesTo === '7' || chord.resolvesTo === '9'
      ? `${root}${chord.resolvesTo}`
      : `${root} major`,
    resolutionMoves,
    resolvedTones,
  }
}

export function randomSuspendedResolutionQuestion(typeFilter) {
  return getSuspendedResolution(randomNote(), pickType(typeFilter))
}
