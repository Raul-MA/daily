import { getKeyboardVoicing } from '../music/notes.js'
import { createExerciseShell, buildExerciseCardHTML } from '../components/exercise-shell.js'
import { MELODIC_MINOR_MODES, MELODIC_MINOR_MODE_NAMES, getMelodicMinorModeNotes, randomMelodicMinorQuestion } from '../music/melodic-minor.js'
const EXERCISE_MODES = [
  { label: 'Spell the mode (name → notes)', value: 'spell' },
  { label: 'Chord → Mode (chord type → mode)', value: 'chord' },
  { label: 'Formula → Name (reverse drill)', value: 'reverse' },
]
function randomReverseQuestion(modeFilter) {
  const pool = modeFilter && modeFilter.length > 0
    ? MELODIC_MINOR_MODES.filter(m => modeFilter.includes(m.name))
    : MELODIC_MINOR_MODES
  const mode = pool[Math.floor(Math.random() * pool.length)]
  return { mode }
}
export { getKeyboardVoicing, createExerciseShell, buildExerciseCardHTML, MELODIC_MINOR_MODES, MELODIC_MINOR_MODE_NAMES, getMelodicMinorModeNotes, randomMelodicMinorQuestion, EXERCISE_MODES, randomReverseQuestion };
