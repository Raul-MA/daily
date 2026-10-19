import { copy } from '../../i18n.js';
import { navigate } from '../router.js'

export default function render(container) {
  container.innerHTML = copy(`<div class="text-muted text-center mt-lg">${copy("Redirecting…")}</div>`)
  navigate('/scales/theory')
}
