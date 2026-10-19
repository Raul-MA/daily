import { copy } from '../../i18n.js';
import { buildKeyboardDiagramHTML, getChordTones, getKeyboardVoicing } from './chord-progressions-exercise-shared.js';
export function renderProgression(ctx) {
    const area = ctx.container.querySelector('.progression-area')
    if (!area) return

    if (ctx.progression.length === 0) {
      area.innerHTML = copy('<p class="text-muted">Press "Generate" to create a progression</p>')
      return
    }

    const chordsHtml = ctx.progression.map(c => {
      const keyboard = getKeyboardVoicing(getChordTones(c.root, c.chordType), { root: c.root })
      return `
      <div class="progression-chord">
        <div class="roman">${copy(c.roman)}</div>
        <div class="chord-name">${copy(c.chordName)}</div>
        <div style="font-size:var(--text-xs);color:var(--text-muted);margin-top:4px">${copy(c.notes.join(' '))}</div>
        ${copy(buildKeyboardDiagramHTML(keyboard.tones, { ...keyboard, label: c.chordName }))}
      </div>
    `
    }).join('')

    area.innerHTML = copy(`<div class="progression-display">${copy(chordsHtml)}</div>`)
  }
