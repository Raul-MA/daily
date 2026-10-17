import { copy } from '../../i18n.js';
export function content(ctx, q) {
if (ctx.state.promptMode === 'progression') return mode0(q);
if (ctx.state.promptMode === 'build') return mode1(q);
return mode2(q);
}
function mode0(q) {

      const answerRows = q.progression.map(step => `
        <tr>
          <td>${copy(step.degree)}</td>
          <td>${copy(step.chordName)}</td>
          <td>${copy(step.voicingType)}</td>
          <td>${copy(step.voicingTones.map(t => t.note).join(' – '))}</td>
          <td>${copy(step.hands.lh.map(t => t.note).join(' – '))}</td>
          <td>${copy(step.hands.rh.map(t => t.note).join(' – '))}</td>
        </tr>
      `).join('')

      const questionHTML = `
        <span class="label">${copy("Voice-lead rootless voicings across ii–V–I")}</span>
        <span class="note-display">${copy(q.key)} ${copy("major")}</span>
        <span class="label">${copy("Target pattern")}</span>
        <span class="question">${copy(q.label)}</span>
      `

      const answerHTML = `
        <span class="answer-label">${copy(q.key)} ${copy("major ii–V–I")}</span>
        <table class="chord-tones-table" style="min-width:420px;margin-top:var(--space-sm)">
          <thead>
            <tr>
              <th>${copy("Function")}</th>
              <th>${copy("Chord")}</th>
              <th>${copy("Voicing")}</th>
              <th>${copy("Notes")}</th>
              <th>${copy("LH")}</th>
              <th>${copy("RH")}</th>
            </tr>
          </thead>
          <tbody>${copy(answerRows)}</tbody>
        </table>
      `
    
return { questionHTML, answerHTML };
}

function mode1(q) {

      const questionHTML = `
        <span class="label">${copy("Spell the rootless voicing")}</span>
        <span class="note-display">${copy(q.chordName)}</span>
        <span class="label">${copy("Key")}</span>
        <span class="question">${copy(q.key)}</span>
        <span class="label">${copy("Voicing type")}</span>
        <span class="chip chip-accent">${copy(q.voicingType)}</span>
      `

      const answerHTML = `
        <span class="answer-label">${copy(q.chordLabel)} ${copy("—")} ${copy(q.voicingType)} ${copy("voicing")}</span>
        <span class="answer-main" style="font-size:var(--text-2xl)">${copy(q.voicingTones.map(t => t.note).join(' – '))}</span>
        <div style="margin-top:var(--space-xs)">
          <span class="chip">${copy("Degrees:")} ${copy(q.voicingTones.map(t => t.degree).join(' – '))}</span>
        </div>
        <div style="margin-top:var(--space-xs)">
          <span class="chip chip-accent">${copy("LH:")} ${copy(q.hands.lh.map(t => t.note).join(' – '))}</span>
          <span class="chip">${copy("RH:")} ${copy(q.hands.rh.map(t => t.note).join(' – '))}</span>
        </div>
      `
    
return { questionHTML, answerHTML };
}

function mode2(q) {

      const questionHTML = `
        <span class="label">${copy("Identify the rootless voicing type")}</span>
        <span class="note-display">${copy(q.chordName)}</span>
        <span class="label">${copy("Notes")}</span>
        <span class="question" style="font-size:var(--text-xl)">${copy(q.voicingTones.map(t => t.note).join(' – '))}</span>
        <span class="label">${copy("LH / RH")}</span>
        <span class="question">${copy(q.hands.lh.map(t => t.note).join(' – '))} / ${copy(q.hands.rh.map(t => t.note).join(' – '))}</span>
      `

      const answerHTML = `
        <span class="answer-label">${copy(q.chordLabel)}</span>
        <span class="answer-main">${copy(q.voicingType)} ${copy("voicing")}</span>
        <span class="answer-sub">${copy(q.voicingTones.map(t => t.degree).join(' – '))}</span>
      `
    
return { questionHTML, answerHTML };
}
