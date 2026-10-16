export function content(ctx, q) {
if (ctx.state.promptMode === 'progression') return mode0(q);
if (ctx.state.promptMode === 'build') return mode1(q);
return mode2(q);
}
function mode0(q) {

      const answerRows = q.progression.map(step => `
        <tr>
          <td>${step.degree}</td>
          <td>${step.chordName}</td>
          <td>${step.voicingType}</td>
          <td>${step.voicingTones.map(t => t.note).join(' – ')}</td>
          <td>${step.hands.lh.map(t => t.note).join(' – ')}</td>
          <td>${step.hands.rh.map(t => t.note).join(' – ')}</td>
        </tr>
      `).join('')

      const questionHTML = `
        <span class="label">Voice-lead rootless voicings across ii–V–I</span>
        <span class="note-display">${q.key} major</span>
        <span class="label">Target pattern</span>
        <span class="question">${q.label}</span>
      `

      const answerHTML = `
        <span class="answer-label">${q.key} major ii–V–I</span>
        <table class="chord-tones-table" style="min-width:420px;margin-top:var(--space-sm)">
          <thead>
            <tr>
              <th>Function</th>
              <th>Chord</th>
              <th>Voicing</th>
              <th>Notes</th>
              <th>LH</th>
              <th>RH</th>
            </tr>
          </thead>
          <tbody>${answerRows}</tbody>
        </table>
      `
    
return { questionHTML, answerHTML };
}

function mode1(q) {

      const questionHTML = `
        <span class="label">Spell the rootless voicing</span>
        <span class="note-display">${q.chordName}</span>
        <span class="label">Key</span>
        <span class="question">${q.key}</span>
        <span class="label">Voicing type</span>
        <span class="chip chip-accent">${q.voicingType}</span>
      `

      const answerHTML = `
        <span class="answer-label">${q.chordLabel} — ${q.voicingType} voicing</span>
        <span class="answer-main" style="font-size:var(--text-2xl)">${q.voicingTones.map(t => t.note).join(' – ')}</span>
        <div style="margin-top:var(--space-xs)">
          <span class="chip">Degrees: ${q.voicingTones.map(t => t.degree).join(' – ')}</span>
        </div>
        <div style="margin-top:var(--space-xs)">
          <span class="chip chip-accent">LH: ${q.hands.lh.map(t => t.note).join(' – ')}</span>
          <span class="chip">RH: ${q.hands.rh.map(t => t.note).join(' – ')}</span>
        </div>
      `
    
return { questionHTML, answerHTML };
}

function mode2(q) {

      const questionHTML = `
        <span class="label">Identify the rootless voicing type</span>
        <span class="note-display">${q.chordName}</span>
        <span class="label">Notes</span>
        <span class="question" style="font-size:var(--text-xl)">${q.voicingTones.map(t => t.note).join(' – ')}</span>
        <span class="label">LH / RH</span>
        <span class="question">${q.hands.lh.map(t => t.note).join(' – ')} / ${q.hands.rh.map(t => t.note).join(' – ')}</span>
      `

      const answerHTML = `
        <span class="answer-label">${q.chordLabel}</span>
        <span class="answer-main">${q.voicingType} voicing</span>
        <span class="answer-sub">${q.voicingTones.map(t => t.degree).join(' – ')}</span>
      `
    
return { questionHTML, answerHTML };
}
