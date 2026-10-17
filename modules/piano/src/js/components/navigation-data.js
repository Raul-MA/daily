import { catalog0 } from './navigation-catalog0.js';
import { catalog1 } from './navigation-catalog1.js';
import { catalog2 } from './navigation-catalog2.js';
import { catalog3 } from './navigation-catalog3.js';
export const ACTIVITY_LABELS = { theory: 'Theory', practice: 'Practice', cards: 'Cards', player: 'Open' };
export const DESTINATIONS = [...catalog0, ...catalog1, ...catalog2, ...catalog3, { id: 'exercise-player', activity: 'player', title: 'Exercise player', path: '/exercise-player', module: 'Practice', keywords: 'import JSON score deliberate practice loops slow piano' }];


const destinationsById = new Map(DESTINATIONS.map(destination => [destination.id, destination]))

export function getDestination(id) {
  const destination = destinationsById.get(id)
  if (!destination) throw new Error(`Unknown destination: ${id}`)
  return destination
}


export function validateRouteLoaders(loaders) {
  for (const { id } of DESTINATIONS) {
    if (typeof loaders[id] !== 'function') throw new Error(`Missing route loader: ${id}`)
  }
  for (const id of Object.keys(loaders)) getDestination(id)
}

export const DESTINATION_SEARCH_ENTRIES = DESTINATIONS.flatMap(({ title, path, module, keywords, aliases = [] }) => [
  { title, path, module, keywords },
  ...aliases.map(alias => ({ ...alias, path })),
])

const topic = (label, slug, activities = ['theory', 'practice']) => ({
  label,
  links: activities.map(activity => {
    if (!Object.hasOwn(ACTIVITY_LABELS, activity)) throw new Error(`Unknown activity: ${activity}`)
    const destination = getDestination(`${slug}.${activity}`)
    return { id: destination.id, kind: ACTIVITY_LABELS[activity], path: destination.path }
  }),
})

export const PRIMARY_LINKS = [
  { label: 'Course', path: getDestination('course').path },
  { label: 'Library', path: getDestination('library').path },
]

export const LIBRARY_GROUPS = [
  { label: 'Your music', description: 'Import and practice your own exercises.', topics: [{ label: 'Exercise player', links: [{ id: 'exercise-player', kind: 'Open', path: '/exercise-player' }] }] },
  {
    label: 'Foundations',
    description: 'Get to know notes, intervals, and scales.',
    topics: [
      topic('Intervals', 'intervals'),
      topic('Scales', 'scales'),
      topic('Pentatonic scales', 'pentatonic', ['theory']),
      topic('Modes', 'modes'),
      topic('Modal characteristics', 'modal-characteristics', ['practice']),
      topic('Ear training', 'ear-training', ['practice']),
      topic('Bebop scales', 'bebop'),
      topic('Melodic minor modes', 'melodic-minor'),
    ],
  },
  {
    label: 'Chords & harmony',
    description: 'Understand chord tones and the colors around them.',
    topics: [
      topic('Tensions', 'tensions'),
      topic('Available tensions', 'available-tensions'),
      topic('Extended chords', 'extended-chords'),
      topic('Suspended chords', 'suspended-chords'),
      topic('Upper structures', 'superimpositions'),
      topic('Harmonic function', 'harmonic-function', ['practice']),
      topic('Modal interchange', 'modal-interchange', ['practice']),
    ],
  },
  {
    label: 'Movement & voicing',
    description: 'Connect chords and turn them into musical phrases.',
    topics: [
      topic('Chord progressions', 'chord-progressions'),
      topic('ii–V–I', 'iivi', ['practice']),
      topic('Secondary dominants', 'secondary-dominants', ['practice']),
      topic('Tritone substitution', 'tritone-sub', ['practice']),
      topic('Chord inversions', 'chord-inversions', ['practice']),
      topic('Shell chords', 'shell-chords'),
      topic('Rootless voicings', 'rootless-voicings'),
      topic('Guide tones', 'voice-leading', ['practice']),
      topic('Modulation', 'modulations'),
    ],
  },
  {
    label: 'Reference',
    description: 'Keep useful musical relationships close at hand.',
    topics: [
      topic('Key signatures', 'key-signatures', ['practice', 'cards']),
      topic('Circle of fifths', 'circle', ['cards']),
      topic('Chord substitution', 'chord-substitution', ['theory']),
      topic('Tensions', 'tensions', ['cards']),
      topic('Available tensions', 'available-tensions', ['cards']),
    ],
  },
]
