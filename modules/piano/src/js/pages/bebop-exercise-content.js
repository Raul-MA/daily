export function content(ctx, q, rows) {
if (ctx.state.mode === 'spell') return mode0(q, rows);
return mode1(q, rows);
}
function mode0(q, rows) {

      const questionHTML = `
        <span class="label">Root note</span>
        <span class="note-display">${q.root}</span>
        <span class="label">Chord type:</span>
        <span class="question">${q.chordFit}</span>
        <span class="label" style="margin-top:var(--space-xs);font-size:var(--text-sm);color:var(--text-muted)">Spell the bebop scale</span>
      `
      const answerHTML = `
        <span class="answer-label">${q.root} ${q.scaleName}</span>
        <table class="chord-tones-table" style="min-width:220px;margin-top:var(--space-sm)">
          <thead><tr><th>#</th><th>Note</th><th></th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <span class="answer-sub" style="margin-top:var(--space-sm)">Steps: ${q.steps}</span>
        <span class="answer-sub" style="font-size:var(--text-sm);color:var(--warning)">★ = chromatic passing tone</span>
      `
    
return { questionHTML, answerHTML };
}

function mode1(q, rows) {

      const questionHTML = `
        <span class="label">Root note</span>
        <span class="note-display">${q.root}</span>
        <span class="label">Scale:</span>
        <span class="question">${q.scaleName}</span>
        <span class="label" style="margin-top:var(--space-xs);font-size:var(--text-sm);color:var(--text-muted)">Which chord does this scale fit?</span>
      `
      const answerHTML = `
        <span class="answer-label">${q.chordFit}</span>
        <table class="chord-tones-table" style="min-width:220px;margin-top:var(--space-sm)">
          <thead><tr><th>#</th><th>Note</th><th></th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <span class="answer-sub" style="margin-top:var(--space-sm)">Steps: ${q.steps}</span>
        <span class="answer-sub" style="font-size:var(--text-sm);color:var(--warning)">★ = chromatic passing tone</span>
      `
    
return { questionHTML, answerHTML };
}
