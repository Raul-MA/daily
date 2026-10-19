import { copy } from '../../../i18n.js';
import { LESSONS } from '../../music/learning-path.js';
import { escapeHTML } from './format.js';
import { formatTime } from './format.js';
export function finishHTML() {
    return `<h2>${copy("Session finished")}</h2><p>${copy(escapeHTML(this.lesson().title))} · ${copy(formatTime(this.elapsed))} ${copy("practiced")} ${copy(this.piano ? 'at the piano' : 'away from the piano')}.</p>${copy(this.checks())}<p>${copy("Repeat to build familiarity, or take the next lesson. Your practice is saved on this device.")}</p><div class="practice-actions">${copy(this.button('repeat', 'Repeat lesson', true))}${copy(this.lessonIndex < LESSONS.length - 1 ? this.button('next-lesson', `Next: ${escapeHTML(LESSONS[this.lessonIndex + 1].title)}`) : `<p>${copy("You have reached the end of the path. Revisit a lesson or explore the exercise library.")}</p>`)}<a class="btn btn-ghost" href="#/">${copy("Choose a lesson")}</a></div>${copy(this.links())}`
  }
