import { copy } from '../../i18n.js';
import { practiceHistory } from '../components/practice-history.js';
import { LESSONS } from '../music/learning-path.js'

const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]))

export default function render(container) {
  container.innerHTML = copy(`
    <div class="course-page">
      <div class="page-header"><h1>${copy("Learn to improvise")}</h1></div>
      <p class="course-intro text-muted">${copy("Build a musical idea, recall the notes, then make a phrase of your own—with or without a piano.")}</p>
      <h2>${copy("Suggested lesson order")}</h2>
      <p class="text-muted">${copy("Start with lesson one or choose any lesson.")}</p>
      <ol class="course-lessons">
        ${copy(LESSONS.map((lesson, index) => `
          <li class="course-lesson${index === 0 ? ' course-lesson-start' : ''}">
            <span class="course-lesson-number" aria-hidden="true">${copy(index + 1)}</span>
            <div class="course-lesson-content">
              <h3 class="course-lesson-title"><a href="#/learn?lesson=${encodeURIComponent(lesson.id)}">${copy(escapeHTML(lesson.title))}</a></h3>
              ${copy(index === 0 ? `<p class="course-lesson-objective">${copy(escapeHTML(lesson.objective))}</p><a class="btn btn-primary" href="#/learn?lesson=${encodeURIComponent(lesson.id)}">${copy("Start lesson")}</a>` : '')}
            </div>
          </li>`).join(''))}
      </ol>
    </div>
  `)
  container.querySelector('.course-page').append(practiceHistory());
}
