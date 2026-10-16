import { LESSONS } from '../../music/learning-path.js';
import { BLOCKS } from './format.js';
import { escapeHTML } from './format.js';
import { formatTime } from './format.js';
export function setupHTML() {
    const current = this.lesson()
    const prerequisite = LESSONS.find(item => item.id === current.prerequisite)?.title || current.prerequisite || 'No earlier lesson needed'
    return `<form class="practice-setup">
        <div class="practice-lesson-summary"><p class="label">Lesson ${this.lessonIndex + 1} of ${LESSONS.length}</p><p>${escapeHTML(current.objective)}</p><p class="text-muted">${current.prerequisite ? 'Suggested preparation: ' : ''}${escapeHTML(prerequisite)}</p><a href="#/">Change lesson</a></div>
        <fieldset><legend>How much time do you have?</legend><div class="practice-actions">${[5, 10, 15, 20].map(value => `<button type="button" class="btn btn-ghost${this.minutes === value ? ' is-selected' : ''}" data-minutes="${value}" aria-pressed="${this.minutes === value}">${value} min</button>`).join('')}</div><details class="practice-options" data-disclosure="duration"${this.customDurationOpen ? ' open' : ''}><summary>Set a custom duration</summary><label for="practice-minutes">Minutes (3–120)</label><input id="practice-minutes" name="minutes" type="number" min="3" max="120" step="1" required value="${this.minutes}"></details></fieldset>
        <label class="practice-checkbox"><input name="piano" type="checkbox"${this.piano ? ' checked' : ''}> I have a piano available</label>
        <button type="submit" class="btn btn-primary">Start session</button>
        <ol class="practice-preview">${BLOCKS.map((name, index) => `<li><strong>${name}</strong> <span data-preview="${index}">${formatTime(this.budgets[index])}</span></li>`).join('')}</ol>
        <p class="text-muted">Move at your own pace. Suggested times guide you; answers stay hidden until you reveal them.</p>
      </form>${this.links()}`
  }
