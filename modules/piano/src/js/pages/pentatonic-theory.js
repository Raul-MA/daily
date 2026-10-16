import { navigate } from '../router.js'

export default function render(container) {
  container.innerHTML = '<div class="text-muted text-center mt-lg">Redirecting…</div>'
  navigate('/scales/theory')
}
