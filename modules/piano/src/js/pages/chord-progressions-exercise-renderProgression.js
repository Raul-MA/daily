import { buildKeyboardDiagramHTML, getChordTones, getKeyboardVoicing } from './chord-progressions-exercise-shared.js';
export function renderProgression(ctx) {
    const area = ctx.container.querySelector('.progression-area')
    if (!area) return

    if (ctx.progression.length === 0) {
      area.innerHTML = '<p class="text-muted">Press "Generate" to create a progression</p>'
      return
    }

    const chordsHtml = ctx.progression.map(c => {
      const keyboard = getKeyboardVoicing(getChordTones(c.root, c.chordType), { root: c.root })
      return `
      <div class="progression-chord">
        <div class="roman">${c.roman}</div>
        <div class="chord-name">${c.chordName}</div>
        <div style="font-size:var(--text-xs);color:var(--text-muted);margin-top:4px">${c.notes.join(' ')}</div>
        ${buildKeyboardDiagramHTML(keyboard.tones, { ...keyboard, label: c.chordName })}
      </div>
    `
    }).join('')

    area.innerHTML = `<div class="progression-display">${chordsHtml}</div>`
  }
