import { copy } from '../../../i18n.js';
import { LESSONS } from '../../music/learning-path.js';
import { BLOCKS } from './format.js';
import { escapeHTML } from './format.js';
import { formatTime } from './format.js';
export function setupHTML() {
    const current = this.lesson()
    const prerequisite = LESSONS.find(item => item.id === current.prerequisite)?.title || current.prerequisite || 'No earlier lesson needed'
    return `<form class="practice-setup">
        <div class="practice-lesson-summary"><p class="label">${copy("Lesson")} ${copy(this.lessonIndex + 1)} ${copy("of")} ${copy(LESSONS.length)}</p><p>${copy(escapeHTML(current.objective))}</p><p class="text-muted">${copy(current.prerequisite ? 'Suggested preparation: ' : '')}${copy(escapeHTML(prerequisite))}</p><a href="#/">${copy("Change lesson")}</a></div>
        <fieldset><legend>${copy("How much time do you have?")}</legend><div class="practice-actions">${copy([5, 10, 15, 20].map(value => `<button type="button" class="btn btn-ghost${this.minutes === value ? ' is-selected' : ''}" data-minutes="${value}" aria-pressed="${this.minutes === value}">${copy(value)} ${copy("min")}</button>`).join(''))}</div><details class="practice-options" data-disclosure="duration"${this.customDurationOpen ? ' open' : ''}><summary>${copy("Set a custom duration")}</summary><label for="practice-minutes">${copy("Minutes (3–120)")}</label><input id="practice-minutes" name="minutes" type="number" min="3" max="120" step="1" required value="${this.minutes}"></details></fieldset>
        <label class="practice-checkbox"><input name="piano" type="checkbox"${this.piano ? ' checked' : ''}> ${copy("I have a piano available")}</label>
        <button type="submit" class="btn btn-primary">${copy("Start session")}</button>
        <ol class="practice-preview">${copy(BLOCKS.map((name, index) => `<li><strong>${copy(name)}</strong> <span data-preview="${index}">${copy(formatTime(this.budgets[index]))}</span></li>`).join(''))}</ol>
        <p class="text-muted">${copy("Move at your own pace. Suggested times guide you; answers stay hidden until you reveal them.")}</p>
      </form>${copy(this.links())}`
  }
