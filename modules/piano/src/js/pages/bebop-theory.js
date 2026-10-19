import { copy } from '../../i18n.js';
import { SCALES, BEBOP_SCALE_NAMES, getScaleNotes } from '../music/scales.js'

export default function render(container) {
  const items = BEBOP_SCALE_NAMES.map(name => {
    const { pattern, steps, note, passingToneIndex, chordFit, chord, parentScale, degree } = SCALES[name]
    const notes = getScaleNotes('C', name)

    const notesHTML = notes.map((n, i) => {
      const isPassing = i === passingToneIndex
      return isPassing
        ? `<span style="color:var(--warning);font-weight:700">${copy(n)}*</span>`
        : `<span>${copy(n)}</span>`
    }).join(' — ')

    return `
      <div class="theory-item">
        <div class="theory-item-title">${copy(name)}</div>
        <div class="theory-item-subtitle">${copy("Parent scale:")} ${copy(parentScale)} ${copy("&nbsp;·&nbsp; Fits over:")} ${copy(degree)}</div>
        <p class="text-muted">${copy("Chord:")} <strong>${copy(chord)}</strong></p>
        <p class="text-muted">${copy("Steps:")} <code>${copy(steps)}</code> ${copy("&nbsp;·&nbsp;")} ${copy(pattern.length)} ${copy("notes")}</p>
        <p class="text-muted">${copy("C example:")} ${copy(notesHTML)}</p>
        <p class="text-muted" style="font-style:italic">${copy(note)}</p>
        <p class="text-muted">${copy("Chord fit:")} <strong>${copy(chordFit)}</strong></p>
      </div>
    `
  }).join('')

  container.innerHTML = copy(`
    <div class="page-header">
      <h1>${copy("Bebop Scales — Theory")}</h1>
      <div class="page-nav-links">
        <a href="#/bebop/exercises">${copy("Exercises →")}</a>
        <a href="#/scales/theory">${copy("All Scales →")}</a>
      </div>
    </div>

    <div class="theory-content">
      <div class="theory-item">
        <div class="theory-item-title">${copy("What is a bebop scale?")}</div>
        <p>${copy("Bebop scales add a single")} <strong>${copy("chromatic passing tone")}</strong> ${copy("to a 7-note parent scale, producing an")} <strong>${copy("8-note")}</strong> ${copy("scale. The extra note has one purpose: when you play a steady stream of 8th notes starting on beat 1, every")} <strong>${copy("chord tone")}</strong> ${copy("(root, 3rd, 5th, 7th) falls on a")} <strong>${copy("strong beat")}</strong> (1, 2, 3, 4).</p>
        <p class="text-muted">${copy("With a 7-note scale, chord tones alternate between strong and weak beats as you ascend — harmonic clarity suffers. The 8th note realigns everything.")}</p>
        <p class="text-muted">${copy("The passing tone is marked with")} <span style="color:var(--warning);font-weight:700">*</span> ${copy("in each example below.")}</p>
      </div>

      <div class="theory-item">
        <div class="theory-item-title">${copy("Strong-beat alignment rule")}</div>
        <p>${copy("Start on the root (beat 1, strong). Each 8th note moves one scale step. With 8 notes per octave, the pattern repeats exactly every bar. Chord tones on positions 1, 3, 5, 7 land on beats 1, 2, 3, 4 — every bar, every octave.")}</p>
        <p class="text-muted">${copy("Practically: begin bebop lines")} <em>${copy("on a chord tone")}</em> ${copy("on a strong beat and the rest of the line will outline the harmony automatically.")}</p>
      </div>

      <div class="theory-list">${copy(items)}</div>
    </div>
  `)
}
