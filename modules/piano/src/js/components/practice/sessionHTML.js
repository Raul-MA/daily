import { copy } from '../../../i18n.js';
import { BLOCKS } from './format.js';
import { escapeHTML } from './format.js';

export function sessionHTML() { return [part0, part1, part2, part3, part4, part5, part6, part7, part8].map(part=>part.call(this)).join('\n'); }

function part0() {
return `<div class="practice-session-heading"><p>${copy(this.piano ? 'At the piano' : 'Away from the piano')} · ${copy(this.minutes)} ${copy("minutes")}</p><p data-clock class="text-muted"></p><p data-block-clock class="text-muted"></p></div>`;
}

function part1() {
return `      <p class="practice-pause-notice" role="status"${this.paused ? '' : ' hidden'}>${copy(escapeHTML(this.pauseReason || 'Session paused.'))} ${copy("Choose Resume when you are ready.")}</p>`;
}

function part2() {
return `      <nav class="practice-blocks" aria-label="Session blocks">${copy(BLOCKS.map((name, index) => `<span${this.block === index ? ' aria-current="step"' : ''}>${copy(index + 1)}. ${copy(name)}</span>`).join(''))}</nav>`;
}

function part3() {
const prompting=this.hasPrompts();
return `      <section class="practice-card card">${copy(this.blockHTML())}${copy(prompting ? `<div class="practice-actions practice-prompt-actions">${copy(this.button('prompt', this.block === 2 && this.lesson().application.sequence?.length ? 'Next chord / step' : 'Next prompt', this.revealed))}</div>` : '')}</section>`;
}

function part4() {
return `      ${this.block === 1 || this.block === 2 ? `<details class="practice-review" data-disclosure="review"${this.reviewOpen ? ' open' : ''}><summary>${copy("Review idea")}</summary><p>${copy(escapeHTML(this.lesson().explanation))}</p></details>` : ''}`;
}

function part5() {
return `      <p class="practice-notice" data-block-notice role="status" hidden>${copy("Suggested block time reached. Keep practicing or choose")} ${copy(this.block === 3 ? 'Finish session' : `Continue to ${BLOCKS[this.block + 1].toLowerCase()}`)} ${copy("when ready.")}</p>`;
}

function part6() {
return `      <p class="practice-notice" data-total-notice role="status" hidden>${copy("Your session budget is complete. You can continue practicing or finish below.")}</p>`;
}

function part7() {
const prompting=this.hasPrompts();
return `      ${prompting ? `<details class="practice-options" data-disclosure="pacing"${this.pacingOpen ? ' open' : ''}><summary>${copy("Prompt pacing")} <span class="text-muted">· <span data-pacing-mode>${copy(this.auto ? 'Automatic' : 'Manual')}</span></span></summary><fieldset class="practice-pacing"><legend>${copy("Automatic prompts")}</legend><label class="practice-checkbox"><input type="checkbox" name="auto"${this.auto ? ' checked' : ''}> ${copy("Automatically advance prompts")}</label><div class="practice-actions">${copy([15, 30, 60].map(seconds => `<button type="button" class="btn btn-ghost" data-pace="${seconds}" aria-pressed="${this.pace === seconds}">${copy(seconds)}${copy("s")}</button>`).join(''))}</div><label for="practice-pace">${copy("Seconds per prompt (1–300)")}</label><input id="practice-pace" name="pace" type="number" min="1" max="300" step="1" value="${this.pace}" aria-describedby="practice-pace-validation" required><p id="practice-pace-validation" role="alert"></p><p data-prompt-clock></p><p class="text-muted">${copy("This changes prompts; it is not a musical metronome. New prompts hide the answer.")}</p></fieldset></details>` : ''}`;
}

function part8() {
const prompting=this.hasPrompts();
return `      <div class="practice-actions practice-navigation">${copy(this.button('previous', 'Previous block', false, this.block === 0))}${copy(this.block < 3 ? this.button('next', `Continue to ${BLOCKS[this.block + 1].toLowerCase()}`, this.block === 0 || (this.block === 2 && !prompting && this.revealed)) : this.button('finish', 'Finish session', true))}${copy(this.button('pause', this.paused ? 'Resume' : 'Pause'))}${copy(this.block < 3 ? this.button('finish', 'End session') : '')}</div>`;
}
