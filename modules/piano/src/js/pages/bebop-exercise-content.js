import { copy } from '../../i18n.js';
export function content(ctx, q, rows) {
if (ctx.state.mode === 'spell') return mode0(q, rows);
return mode1(q, rows);
}
function mode0(q, rows) {

      const questionHTML = `
        <span class="label">${copy("Root note")}</span>
        <span class="note-display">${copy(q.root)}</span>
        <span class="label">${copy("Chord type:")}</span>
        <span class="question">${copy(q.chordFit)}</span>
        <span class="label" style="margin-top:var(--space-xs);font-size:var(--text-sm);color:var(--text-muted)">${copy("Spell the bebop scale")}</span>
      `
      const answerHTML = `
        <span class="answer-label">${copy(q.root)} ${copy(q.scaleName)}</span>
        <table class="chord-tones-table" style="min-width:220px;margin-top:var(--space-sm)">
          <thead><tr><th>#</th><th>${copy("Note")}</th><th></th></tr></thead>
          <tbody>${copy(rows)}</tbody>
        </table>
        <span class="answer-sub" style="margin-top:var(--space-sm)">${copy("Steps:")} ${copy(q.steps)}</span>
        <span class="answer-sub" style="font-size:var(--text-sm);color:var(--warning)">${copy("★ = chromatic passing tone")}</span>
      `
    
return { questionHTML, answerHTML };
}

function mode1(q, rows) {

      const questionHTML = `
        <span class="label">${copy("Root note")}</span>
        <span class="note-display">${copy(q.root)}</span>
        <span class="label">${copy("Scale:")}</span>
        <span class="question">${copy(q.scaleName)}</span>
        <span class="label" style="margin-top:var(--space-xs);font-size:var(--text-sm);color:var(--text-muted)">${copy("Which chord does this scale fit?")}</span>
      `
      const answerHTML = `
        <span class="answer-label">${copy(q.chordFit)}</span>
        <table class="chord-tones-table" style="min-width:220px;margin-top:var(--space-sm)">
          <thead><tr><th>#</th><th>${copy("Note")}</th><th></th></tr></thead>
          <tbody>${copy(rows)}</tbody>
        </table>
        <span class="answer-sub" style="margin-top:var(--space-sm)">${copy("Steps:")} ${copy(q.steps)}</span>
        <span class="answer-sub" style="font-size:var(--text-sm);color:var(--warning)">${copy("★ = chromatic passing tone")}</span>
      `
    
return { questionHTML, answerHTML };
}
