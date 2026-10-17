import { copy } from '../../i18n.js';
const CIRCLE_OF_FIFTHS  = ['C','G','D','A','E','B','F#/Gb','Db','Ab','Eb','Bb','F']
const CIRCLE_OF_FOURTHS = ['C','F','Bb','Eb','Ab','Db','Gb/F#','B','E','A','D','G']

export default function render(container) {
  const fifthsHtml = CIRCLE_OF_FIFTHS.map(n => `<div class="circle-note">${copy(n)}</div>`).join('')
  const fourthsHtml = CIRCLE_OF_FOURTHS.map(n => `<div class="circle-note">${copy(n)}</div>`).join('')

  container.innerHTML = copy(`
    <div class="page-header">
      <h1>${copy("Circle of Fifths / Fourths")}</h1>
    </div>

    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:var(--space-xl)">
      <div>
        <h2>${copy("Circle of Fifths")}</h2>
        <p class="text-muted mb-md">${copy("Each step moves up a perfect 5th (7 semitones).")}<br>${copy("Moving clockwise adds one sharp to the key signature.")}</p>
        <div class="circle-grid">${copy(fifthsHtml)}</div>
      </div>
      <div>
        <h2>${copy("Circle of Fourths")}</h2>
        <p class="text-muted mb-md">${copy("Each step moves up a perfect 4th (5 semitones).")}<br>${copy("Moving clockwise adds one flat to the key signature.")}</p>
        <div class="circle-grid">${copy(fourthsHtml)}</div>
      </div>
    </div>

    <div class="theory-item mt-lg" style="max-width:600px">
      <div class="theory-item-title">${copy("Key relationships")}</div>
      <p class="text-muted">${copy("Keys adjacent on the circle of fifths are closely related — they share 6 of 7 notes. This makes them good candidates for modulation.")}</p>
      <p class="text-muted">${copy("The circle of fourths is simply the circle of fifths traversed in the opposite direction.")}</p>
    </div>
  `)
}
