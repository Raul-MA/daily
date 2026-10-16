import { escapeHTML } from './format.js';
export function blockHTML() { return [explain, recall, apply, recap][this.block].call(this); }

function explain() {
const current=this.lesson();
return `<h2>Understand the idea</h2><p>${escapeHTML(current.explanation)}</p><p><strong>Your aim:</strong> ${escapeHTML(current.objective)}</p><p class="text-muted">Read at your own pace, then try recalling the notes.</p>`
}

function recall() {
return `<h2>Recall the notes</h2><p class="practice-question">${escapeHTML(this.prompt.question)}</p><p class="text-muted">${this.piano ? 'Name your answer and find it on the piano before revealing.' : 'Name your answer and picture its keyboard position before revealing.'}</p>${this.revealed ? this.answerHTML(this.prompt.answer, this.prompt.keyboard) : this.button('reveal', this.prompt.example ? 'Show an example' : 'Reveal answer', true)}`
}

function apply() {
const current=this.lesson();

      const application = current.application
      const sequence = application.sequence
      const step = sequence?.length ? sequence[this.applicationIndex % sequence.length] : null
      return `<h2>Put it into a phrase</h2><p>${escapeHTML(this.piano ? application.piano : application.away)}</p>${step ? `<p class="label">Step ${this.applicationIndex % sequence.length + 1} of ${sequence.length}: ${escapeHTML(step.label)}</p><p>${escapeHTML(step.instruction)}</p>` : '<p class="text-muted">Repeat this task at your own pace, varying your phrase each time.</p>'}${this.revealed ? this.answerHTML(application.example, step?.keyboard || application.keyboard) : this.button('reveal', 'Show an example', true)}`
    
}

function recap() {
return `<h2>Check in with yourself</h2><p>There is no score. Use these questions to decide whether to repeat or continue.</p>${this.checks()}${!this.piano ? '<p class="text-muted">Next time you have a piano, try these note choices with your hands.</p>' : ''}${this.links()}`
}
