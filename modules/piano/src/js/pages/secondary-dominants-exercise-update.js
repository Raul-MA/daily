import { copy } from '../../i18n.js';
import { getKeyboardVoicing, buildExerciseCardHTML, buildChordTonesTableHTML, CHORD_TYPES, getChordTones } from './secondary-dominants-exercise-shared.js';
export function update(ctx) {
    const q = ctx.state.question
    if (!q) return

    let questionHTML, answerHTML

    if (!ctx.state.inverse) {
      
      questionHTML = `
        <span class="label">${copy("Key")}</span>
        <span class="note-display">${copy(q.keyRoot)} ${copy("major")}</span>
        <span class="label">${copy("Find the secondary dominant of")}</span>
        <span class="question">${copy(q.targetRoman)} ${copy("—")} ${copy(q.targetChordName)}</span>
      `
      const tonesTable = buildChordTonesTableHTML(
        q.secDomNotes.map((note, i) => ({ degree: ['1','3','5','♭7'][i], note }))
      )
      answerHTML = `
        <span class="answer-label">${copy(q.symbol)}</span>
        <span class="answer-main" style="font-size:var(--text-xl)">${copy(q.secDomChordName)}</span>
        ${copy(tonesTable)}
        <span class="answer-sub" style="margin-top:var(--space-sm)">${copy("Resolves to:")} ${copy(q.targetChordName)}</span>
      `
    } else {
      
      questionHTML = `
        <span class="label">${copy("Key")}</span>
        <span class="note-display">${copy(q.keyRoot)} ${copy("major")}</span>
        <span class="label">${copy("This chord is a secondary dominant:")}</span>
        <span class="question">${copy(q.secDomChordName)}</span>
        <span class="card-hint" style="margin-top:var(--space-sm)">${copy("Which degree does it tonicise?")}</span>
      `
      const targetDegrees = CHORD_TYPES[q.targetChordType]?.degrees ?? q.targetNotes.map((_, i) => String(i + 1))
      const targetTable = buildChordTonesTableHTML(
        q.targetNotes.map((note, i) => ({
          degree: targetDegrees[i] ?? String(i + 1),
          note,
        }))
      )
      answerHTML = `
        <span class="answer-label">${copy(q.secDomChordName)} = ${copy(q.symbol)}</span>
        <span class="answer-main" style="font-size:var(--text-xl)">${copy("Tonicises")} ${copy(q.targetRoman)}</span>
        <span class="answer-sub">${copy("Target:")} ${copy(q.targetChordName)}</span>
        ${copy(targetTable)}
      `
    }

    const keyboards = [
      {
        ...getKeyboardVoicing(getChordTones(q.secDomRoot, '7'), { root: q.secDomRoot }),
        label: `${q.symbol} — ${q.secDomChordName}`,
      },
      {
        ...getKeyboardVoicing(getChordTones(q.targetNote, q.targetChordType), { root: q.targetNote }),
        label: `Target — ${q.targetChordName}`,
      },
    ]

    ctx.shell.renderCard(buildExerciseCardHTML({ questionHTML, answerHTML, keyboards, revealed: ctx.state.revealed }))

    ctx.container.querySelector('.exercise-card').addEventListener('click', () => {
      ctx.state.revealed = !ctx.state.revealed
      ctx.update()
    })
  }
