import { createExerciseShell, buildExerciseCardHTML } from '../components/exercise-shell.js'
import { SCALES, BEBOP_SCALE_NAMES, BEBOP_SCALE_CONTEXT, getScaleNotes } from '../music/scales.js'
import { randomNote, getKeyboardVoicing } from '../music/notes.js'
const EXERCISE_MODES = [
  { label: 'Spell the scale (chord → notes)', value: 'spell' },
  { label: 'Identify the chord (scale → chord)', value: 'identify' },
]
function randomBebopQuestion(scaleFilter) {
  const pool = scaleFilter && scaleFilter.length > 0
    ? BEBOP_SCALE_NAMES.filter(n => scaleFilter.includes(n))
    : BEBOP_SCALE_NAMES
  const scaleName = pool[Math.floor(Math.random() * pool.length)]
  const root = randomNote()
  const notes = getScaleNotes(root, scaleName)
  const scale = SCALES[scaleName] || {}
  const { pattern, steps, passingToneIndex } = scale
  const chordFit = scale.chordFit || BEBOP_SCALE_CONTEXT[scaleName]?.chordFit || ''
  return { root, scaleName, notes, pattern, steps, passingToneIndex, chordFit }
}
export { createExerciseShell, buildExerciseCardHTML, SCALES, BEBOP_SCALE_NAMES, BEBOP_SCALE_CONTEXT, getScaleNotes, randomNote, getKeyboardVoicing, EXERCISE_MODES, randomBebopQuestion };
