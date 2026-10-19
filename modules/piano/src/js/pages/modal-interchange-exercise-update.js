import { copy } from '../../i18n.js';
import { getKeyboardVoicing, buildExerciseCardHTML, buildChordTonesTableHTML, CHORD_TYPES } from './modal-interchange-exercise-shared.js';
export function update(ctx) {
    const q = ctx.state.question
    if (!q) return

    const degrees = CHORD_TYPES[q.chordType]?.degrees ?? q.notes.map((_, i) => String(i + 1))
    const tonesTable = buildChordTonesTableHTML(
      q.notes.map((note, i) => ({ degree: degrees[i] ?? String(i + 1), note }))
    )

    let questionHTML, answerHTML

    if (!ctx.state.inverse) {
      
      questionHTML = `
        <span class="label">${copy("Key")}</span>
        <span class="note-display">${copy(q.keyRoot)} ${copy("major")}</span>
        <span class="label">${copy("Find the borrowed chord")}</span>
        <span class="question">${copy(q.romanBorrowed)}</span>
      `
      answerHTML = `
        <span class="answer-label">${copy(q.romanBorrowed)} ${copy("in")} ${copy(q.keyRoot)} ${copy("major")}</span>
        <span class="answer-main" style="font-size:var(--text-xl)">${copy(q.chordName)}</span>
        <span class="answer-sub">${copy("Source: parallel")} ${copy(q.source)}</span>
        <span class="answer-sub text-muted">${copy(q.description)}</span>
        ${copy(tonesTable)}
      `
    } else {
      
      questionHTML = `
        <span class="label">${copy("Key")}</span>
        <span class="note-display">${copy(q.keyRoot)} ${copy("major")}</span>
        <span class="label">${copy("Identify this borrowed chord:")}</span>
        <span class="question">${copy(q.chordName)}</span>
      `
      answerHTML = `
        <span class="answer-label">${copy(q.chordName)} ${copy("in")} ${copy(q.keyRoot)} ${copy("major")}</span>
        <span class="answer-main" style="font-size:var(--text-xl)">${copy(q.romanBorrowed)}</span>
        <span class="answer-sub">${copy("Source: parallel")} ${copy(q.source)}</span>
        <span class="answer-sub text-muted">${copy(q.description)}</span>
        ${copy(tonesTable)}
      `
    }

    ctx.shell.renderCard(buildExerciseCardHTML({
      questionHTML, answerHTML, revealed: ctx.state.revealed,
      keyboards: [{ ...getKeyboardVoicing(q.notes.map((note, index) => ({ note, degree: CHORD_TYPES[q.chordType]?.degrees[index] }))), label: `${q.chordName} from parallel ${q.source}` }],
    }))

    ctx.container.querySelector('.exercise-card').addEventListener('click', () => {
      ctx.state.revealed = !ctx.state.revealed
      ctx.update()
    })
  }
