import { copy } from '../../../i18n.js';
import { escapeHTML } from './format.js';
export function blockHTML() { return [explain, recall, apply, recap][this.block].call(this); }

function explain() {
const current=this.lesson();
return `<h2>${copy("Understand the idea")}</h2><p>${copy(escapeHTML(current.explanation))}</p><p><strong>${copy("Your aim:")}</strong> ${copy(escapeHTML(current.objective))}</p><p class="text-muted">${copy("Read at your own pace, then try recalling the notes.")}</p>`
}

function recall() {
return `<h2>${copy("Recall the notes")}</h2><p class="practice-question">${copy(escapeHTML(this.prompt.question))}</p><p class="text-muted">${copy(this.piano ? 'Name your answer and find it on the piano before revealing.' : 'Name your answer and picture its keyboard position before revealing.')}</p>${copy(this.revealed ? this.answerHTML(this.prompt.answer, this.prompt.keyboard) : this.button('reveal', this.prompt.example ? 'Show an example' : 'Reveal answer', true))}`
}

function apply() {
const current=this.lesson();

      const application = current.application
      const sequence = application.sequence
      const step = sequence?.length ? sequence[this.applicationIndex % sequence.length] : null
      return `<h2>${copy("Put it into a phrase")}</h2><p>${copy(escapeHTML(this.piano ? application.piano : application.away))}</p>${copy(step ? `<p class="label">${copy("Step")} ${copy(this.applicationIndex % sequence.length + 1)} ${copy("of")} ${copy(sequence.length)}: ${copy(escapeHTML(step.label))}</p><p>${copy(escapeHTML(step.instruction))}</p>` : `<p class="text-muted">${copy("Repeat this task at your own pace, varying your phrase each time.")}</p>`)}${copy(this.revealed ? this.answerHTML(application.example, step?.keyboard || application.keyboard) : this.button('reveal', 'Show an example', true))}`
    
}

function recap() {
return `<h2>${copy("Check in with yourself")}</h2><p>${copy("There is no score. Use these questions to decide whether to repeat or continue.")}</p>${copy(this.checks())}${copy(!this.piano ? `<p class="text-muted">${copy("Next time you have a piano, try these note choices with your hands.")}</p>` : '')}${copy(this.links())}`
}
