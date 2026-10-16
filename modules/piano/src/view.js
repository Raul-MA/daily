import { rememberUI, restoreUI } from './ui-drafts.js';
import { pianoContext } from './js/context.js';
import { loadDestination } from './js/app.js';
import { destinationForRoute, pianoHref, rewriteLinks } from './js/router.js';
import { initNavigation } from './js/components/sidebar.js';

function frame() {
  const host = document.createElement('section');
  host.dataset.module = 'piano';
  host.innerHTML = '<div id="app-shell"><div id="main-wrapper"><header id="topbar"><a class="brand-link" aria-label="Toniq course">Toniq</a><nav class="primary-navigation" aria-label="Main navigation"></nav><div id="search-container"></div></header><div id="page-content" tabindex="-1"><p data-piano-loading role="status">Loading piano…</p></div></div></div>';
  host.querySelector('.brand-link').href = pianoHref('/');
  return host;
}
export function mountPiano(options) {
  Object.assign(pianoContext, { service: options.service, base: options.base });
  const host = frame();
  const focusHeading = !options.ui.rendered;
  options.ui.rendered = true;
  const content = host.querySelector('#page-content');
  const stopNavigation = initNavigation(host);
  let cleanup;
  let disposed = false;
  const observer = new MutationObserver(() => rewriteLinks(host));
  observer.observe(host, { childList: true, subtree: true });
  async function load() {
    if (options.route.query.has('random')) { window.location.hash = `/piano/exercises/${encodeURIComponent(options.service.pickExercise())}`; return; }
    const destination = destinationForRoute(options.route);
    const page = await loadDestination(destination.id);
    if (disposed) return;
    if (destination.activity === 'practice') options.service.openExercise(destination.id);
    cleanup = page.default(content);
    restoreUI(content, options.ui, cleanup);
    rewriteLinks(host);
    const heading = content.querySelector('h1');
    if (heading) { heading.tabIndex = -1; if (focusHeading) heading.focus({ preventScroll: true }); document.title = `${heading.textContent} · Daily`; }
  }
  load().catch(error => {
    if (disposed) return;
    content.replaceChildren();
    const title = document.createElement('h1');
    title.textContent = error.message;
    content.append(title);
  });
  return {
    node: host,
    dispose: () => { disposed = true; rememberUI(content, options.ui); cleanup?.(); observer.disconnect(); stopNavigation(); },
    restore: () => cleanup?.restore?.(),
    conflict: () => { const alert = document.createElement('p'); alert.setAttribute('role', 'alert'); alert.textContent = 'Data changed in another view. Your draft has been kept.'; content.append(alert); },
  };
}
