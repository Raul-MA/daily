

import { transpose, isFlat } from './notes.js'
import { randomNote } from './notes.js'


const MAJOR_TRIAD = [0, 4, 7]


export const SUPERIMPOSITIONS = [
  {
    id: 'lydian',
    degreeLabel: 'II',               
    upperTriadSemitones: 2,          
    triadIntervals: MAJOR_TRIAD,
    triadQuality: 'major',
    flatDegree: false,               
    tensions: ['9', '♯11', '13'],
    colorLabel: 'Lydian',
    scaleRef: { type: 'mode', name: 'Lydian', path: '/modes/theory' },
    chordContext: 'maj7(♯11)',
    description:
      'A major triad built on the 2nd degree (II) supplies 9, ♯11, and 13 — ' +
      'the three colour tones that distinguish Lydian from plain major.',
  },
  {
    id: 'mixolydian',
    degreeLabel: '♭VII',             
    upperTriadSemitones: 10,         
    triadIntervals: MAJOR_TRIAD,
    triadQuality: 'major',
    flatDegree: true,                
    tensions: ['♭7', '9', '11'],
    colorLabel: 'Mixolydian / sus',
    scaleRef: { type: 'mode', name: 'Mixolydian', path: '/modes/theory' },
    chordContext: '7sus4 / 7',
    description:
      'A major triad built on the ♭7th degree (♭VII) provides ♭7, 9, and 11 — ' +
      'the suspended dominant or Mixolydian sound.',
  },
  {
    id: 'phrygian',
    degreeLabel: '♭II',              
    upperTriadSemitones: 1,          
    triadIntervals: MAJOR_TRIAD,
    triadQuality: 'major',
    flatDegree: true,                
    tensions: ['♭9', '11', '♭13'],
    colorLabel: 'Phrygian',
    scaleRef: { type: 'mode', name: 'Phrygian', path: '/modes/theory' },
    chordContext: '7sus♭9 / pedal',
    description:
      'A major triad built on ♭II supplies ♭9, 11, and ♭13 — ' +
      'the dark Phrygian or pedal-point colour.',
  },
]

export const SUPERIMPOSITION_IDS          = SUPERIMPOSITIONS.map(s => s.id)
export const SUPERIMPOSITION_COLOR_LABELS = SUPERIMPOSITIONS.map(s => s.colorLabel)




function getUSTNotes(bassRoot, ust) {
  const useFlats = isFlat(bassRoot) || ust.flatDegree
  const triadRoot = transpose(bassRoot, ust.upperTriadSemitones, useFlats)
  return {
    triadRoot,
    notes: ust.triadIntervals.map(offset => transpose(triadRoot, offset, isFlat(triadRoot))),
  }
}


function formatSlashChord(triadRoot, triadQuality, bassNote) {
  let qual = triadQuality;
  if (triadQuality === 'major') qual = '';
  if (triadQuality === 'minor') qual = 'm';
  return `${triadRoot}${qual}/${bassNote}`
}


export function randomSuperimpositionQuestion(filterIds, inverse = false) {
  const pool = filterIds && filterIds.length > 0
    ? SUPERIMPOSITIONS.filter(s => filterIds.includes(s.id))
    : SUPERIMPOSITIONS
  if (pool.length === 0) return randomSuperimpositionQuestion(null, inverse)

  const ust = pool[Math.floor(Math.random() * pool.length)]
  const bassRoot = randomNote()
  const { triadRoot, notes } = getUSTNotes(bassRoot, ust)
  const slashChord = formatSlashChord(triadRoot, ust.triadQuality, bassRoot)

  return { ust, bassRoot, triadRoot, notes, slashChord, inverse }
}
