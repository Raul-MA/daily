import { copy } from '../../i18n.js';
import { pianoAsset } from '../router.js';
import { KEY_SIGNATURES, describeKeySignature } from '../music/key-signatures.js'

export default function render(container) {
  const cards = KEY_SIGNATURES.map(ks => `
    <div class="card">
      <div class="card-title">${copy(ks.key)} ${copy("Major")}</div>
      <p class="text-muted">${copy(describeKeySignature(ks))}</p>
      <p class="text-muted">${copy("Relative minor:")} <strong>${copy(ks.relativeMinor)}${copy("m")}</strong></p>
      <img class="key-sig-img" src="${pianoAsset(ks.img)}" alt="${ks.key} major key signature" onerror="this.style.display='none'" />
    </div>
  `).join('')

  container.innerHTML = copy(`
    <div class="page-header">
      <h1>${copy("Key Signatures — Cards")}</h1>
      <div class="page-nav-links">
        <a href="#/key-signatures/exercises">${copy("Exercises →")}</a>
      </div>
    </div>

    <div class="card-grid">${copy(cards)}</div>
  `)
}
