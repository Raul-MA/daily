import { LESSONS } from '../../music/learning-path.js';
import { escapeHTML } from './format.js';
import { formatTime } from './format.js';
export function finishHTML() {
    return `<h2>Session finished</h2><p>${escapeHTML(this.lesson().title)} · ${formatTime(this.elapsed)} practiced ${this.piano ? 'at the piano' : 'away from the piano'}.</p>${this.checks()}<p>Repeat to build familiarity, or take the next lesson. Your practice is saved on this device.</p><div class="practice-actions">${this.button('repeat', 'Repeat lesson', true)}${this.lessonIndex < LESSONS.length - 1 ? this.button('next-lesson', `Next: ${escapeHTML(LESSONS[this.lessonIndex + 1].title)}`) : '<p>You have reached the end of the path. Revisit a lesson or explore the exercise library.</p>'}<a class="btn btn-ghost" href="#/">Choose a lesson</a></div>${this.links()}`
  }
