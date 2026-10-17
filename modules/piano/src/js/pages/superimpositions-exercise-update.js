import { copy } from '../../i18n.js';
import { getKeyboardVoicing, buildExerciseCardHTML, buildChordTonesTableHTML } from './superimpositions-exercise-shared.js';
export function update(ctx) {
    const q = ctx.state.question
    if (!q) return

    const tonesTable = buildChordTonesTableHTML(
      q.notes.map((note, i) => ({ degree: q.ust.tensions[i], note })),
    )

    let questionHTML, answerHTML

    if (!q.inverse) {
      
      questionHTML = `
        <span class="label">${copy("Identify the colour of this upper structure")}</span>
        <span class="note-display" style="font-size:var(--text-xl)">${copy(q.slashChord)}</span>
        <span class="label" style="margin-top:var(--space-sm)">${copy("Bass note:")} ${copy(q.bassRoot)}</span>
      `
      answerHTML = `
        <span class="answer-label">${copy(q.slashChord)}</span>
        <span class="answer-main" style="font-size:var(--text-xl)">${copy(q.bassRoot)} ${copy(q.ust.colorLabel)}</span>
        <span class="answer-sub">${copy("Tensions:")} ${copy(q.ust.tensions.join(', '))}</span>
        <span class="answer-sub text-muted">${copy("Context:")} ${copy(q.bassRoot)}${copy(q.ust.chordContext)}</span>
        <span class="answer-sub text-muted">${copy(q.ust.description)}</span>
        ${copy(tonesTable)}
        <span class="answer-sub" style="margin-top:var(--space-sm)">
          <a href="#${q.ust.scaleRef.path}">${copy(q.ust.scaleRef.name)} ${copy("mode →")}</a>
        </span>
      `
    } else {
      
      questionHTML = `
        <span class="label">${copy("Find an upper-structure triad for this sound")}</span>
        <span class="note-display" style="font-size:var(--text-xl)">${copy(q.bassRoot)} ${copy(q.ust.colorLabel)}</span>
        <span class="label" style="margin-top:var(--space-sm)">${copy("Chord context:")} ${copy(q.bassRoot)}${copy(q.ust.chordContext)}</span>
      `
      answerHTML = `
        <span class="answer-label">${copy(q.bassRoot)} ${copy(q.ust.colorLabel)}</span>
        <span class="answer-main" style="font-size:var(--text-xl)">${copy(q.slashChord)}</span>
        <span class="answer-sub">${copy("Tensions supplied:")} ${copy(q.ust.tensions.join(', '))}</span>
        <span class="answer-sub text-muted">${copy(q.ust.description)}</span>
        ${copy(tonesTable)}
        <span class="answer-sub" style="margin-top:var(--space-sm)">
          <a href="#${q.ust.scaleRef.path}">${copy(q.ust.scaleRef.name)} ${copy("mode →")}</a>
        </span>
      `
    }

    const keyboards = [{
      ...getKeyboardVoicing([
        { note: q.bassRoot, degree: '1', role: 'bass' },
        ...q.notes.map((note, index) => ({ note, degree: q.ust.tensions[index], role: 'upper' })),
      ]),
      label: `${q.slashChord} — example voicing`,
    }]

    ctx.shell.renderCard(buildExerciseCardHTML({ questionHTML, answerHTML, keyboards, revealed: ctx.state.revealed }))

    ctx.container.querySelector('.exercise-card').addEventListener('click', () => {
      ctx.state.revealed = !ctx.state.revealed
      ctx.update()
    })
  }
