

import { transpose, spellInterval, randomNote, noteToIndex } from './notes.js'


export const INTERVALS = [
  { semitones: 0,  name: 'Unison',       abbr: 'P1'  },
  { semitones: 1,  name: 'Minor 2nd',    abbr: 'm2',  tension: 'b9'  },
  { semitones: 2,  name: 'Major 2nd',    abbr: 'M2',  tension: '9'   },
  { semitones: 3,  name: 'Minor 3rd',    abbr: 'm3',  tension: '#9'  },
  { semitones: 4,  name: 'Major 3rd',    abbr: 'M3'  },
  { semitones: 5,  name: 'Perfect 4th',  abbr: 'P4',  tension: '11'  },
  { semitones: 6,  name: 'Tritone',      abbr: 'TT',  tension: '#11' },
  { semitones: 7,  name: 'Perfect 5th',  abbr: 'P5'  },
  { semitones: 8,  name: 'Minor 6th',    abbr: 'm6',  tension: 'b13' },
  { semitones: 9,  name: 'Major 6th',    abbr: 'M6',  tension: '13'  },
  { semitones: 10, name: 'Minor 7th',    abbr: 'm7'  },
  { semitones: 11, name: 'Major 7th',    abbr: 'M7'  },
  { semitones: 12, name: 'Octave',       abbr: 'P8'  },
]


const BY_SEMITONES = new Map(INTERVALS.map(i => [i.semitones, i]))


export function getInterval(semitones) {
  const s = ((semitones % 12) + 12) % 12
  return BY_SEMITONES.get(s) || BY_SEMITONES.get(semitones) || null
}


export function applyInterval(root, semitones, useFlats) {
  if (useFlats !== undefined) return transpose(root, semitones, useFlats)
  const distance = Math.abs(semitones)
  const degrees = [1, 2, 2, 3, 3, 4, 4, 5, 6, 6, 7, 7]
  const degree = degrees[distance % 12] + Math.floor(distance / 12) * 7
  return spellInterval(root, semitones, degree)
}


export function randomInterval(filter) {
  const pool = filter && filter.length > 0
    ? INTERVALS.filter(i => filter.includes(i.semitones))
    : INTERVALS.filter(i => i.semitones > 0 && i.semitones < 12)
  if (pool.length === 0) throw new Error('randomInterval: empty pool after filter')
  return pool[Math.floor(Math.random() * pool.length)]
}


export function randomIntervalQuestion(semitonesFilter, roots) {
  const interval = randomInterval(semitonesFilter)
  const root     = randomNote(roots)
  const result   = applyInterval(root, interval.semitones)
  return { root, interval, result }
}


export function intervalBetween(noteA, noteB) {
  const a = noteToIndex(noteA)
  const b = noteToIndex(noteB)
  if (a === null || b === null) return null
  const semitones = ((b - a) % 12 + 12) % 12
  return getInterval(semitones)
}


export const INTERVAL_NAMES = INTERVALS.filter(i => i.semitones > 0 && i.semitones <= 12)
  .map(i => ({ label: `${i.name} (${i.semitones} st)`, value: i.semitones }))
