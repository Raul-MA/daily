import { pianoAsset } from '../router.js';
import { KEY_SIGNATURES, describeKeySignature } from '../music/key-signatures.js'

export default function render(container) {
  const cards = KEY_SIGNATURES.map(ks => `
    <div class="card">
      <div class="card-title">${ks.key} Major</div>
      <p class="text-muted">${describeKeySignature(ks)}</p>
      <p class="text-muted">Relative minor: <strong>${ks.relativeMinor}m</strong></p>
      <img class="key-sig-img" src="${pianoAsset(ks.img)}" alt="${ks.key} major key signature" onerror="this.style.display='none'" />
    </div>
  `).join('')

  container.innerHTML = `
    <div class="page-header">
      <h1>Key Signatures — Cards</h1>
      <div class="page-nav-links">
        <a href="#/key-signatures/exercises">Exercises →</a>
      </div>
    </div>

    <div class="card-grid">${cards}</div>
  `
}
