import { copy } from '../../i18n.js';
import { buildExerciseCardHTML, getKeyboardVoicing } from './ear-training-exercise-shared.js';
export function update(ctx) {
    const q = ctx.state.question
    if (!q) return

    const questionHTML = `
      <p class="ear-training-status${ctx.state.playing ? ' playing' : ' waiting'}" style="min-height:2em">${copy(ctx.state.status)}</p>
      <div class="row" style="justify-content:center;gap:var(--space-sm)">
        <button class="btn btn-primary play-btn" ${ctx.state.playing ? 'disabled' : ''}>${copy("&#9654; Play")}</button>
      </div>
      <span class="note-display" style="font-size:var(--text-4xl)">?</span>
      <span class="label">${copy("Identify the interval")}</span>
    `

    const answerHTML = `
      <span class="answer-label">${copy("Interval")}</span>
      <span class="answer-main">${copy(q.interval.name)}</span>
      <span class="answer-sub">${copy(q.interval.semitones)} ${copy("semitones &nbsp;·&nbsp;")} ${copy(q.interval.abbr)}</span>
      <div class="row" style="justify-content:center;gap:var(--space-sm);margin-top:var(--space-sm)">
        <button class="btn btn-ghost btn-sm play-again-btn">${copy("&#9654; Play again")}</button>
      </div>
    `

    ctx.shell.renderCard(buildExerciseCardHTML({
      questionHTML, answerHTML, revealed: ctx.state.revealed,
      keyboards: [{ ...getKeyboardVoicing(q.tones, { startOctave: q.tones[0].octave }), label: 'The two recorded notes' }],
    }))

    const playBtn = ctx.container.querySelector('.play-btn')
    if (playBtn) playBtn.addEventListener('click', e => { e.stopPropagation(); ctx.playInterval(q) })

    const playAgainBtn = ctx.container.querySelector('.play-again-btn')
    if (playAgainBtn) playAgainBtn.addEventListener('click', e => { e.stopPropagation(); ctx.playInterval(q) })

    ctx.container.querySelector('.exercise-card').addEventListener('click', () => {
      ctx.state.revealed = !ctx.state.revealed
      ctx.update()
    })
  }
