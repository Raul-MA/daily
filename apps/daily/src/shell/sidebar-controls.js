import { sidebarCopy } from './sidebar.js';

const mobile = () => matchMedia('(max-width: 899px)').matches;

function modalState(aside, phone, open, copy) {
  aside.inert = !open;
  aside.setAttribute('aria-hidden', String(!open));
  aside.querySelector('[data-sidebar-close]').setAttribute('aria-label', phone ? copy.closeMenu : copy.collapseSidebar);
  if (phone && open) { aside.setAttribute('role', 'dialog'); aside.setAttribute('aria-modal', 'true'); }
  else { aside.removeAttribute('role'); aside.removeAttribute('aria-modal'); }
}

function sectionAvailability(root, aside) {
  for (const button of aside.querySelectorAll('[data-sidebar-target]')) {
    const target = root.querySelector('.shell-main').querySelector(button.dataset.sidebarTarget);
    button.disabled = !target || (!target.hasAttribute('data-menu-panel') && target.getClientRects().length === 0);
    if (target?.hasAttribute('data-menu-panel') && !target.hidden) button.setAttribute('aria-current', 'location');
  }
}

export function syncSidebar(context) {
  const { root } = context;
  const aside = root.querySelector('.shell-sidebar');
  if (!aside) return;
  const phone = mobile();
  const open = phone ? Boolean(context.menuOpen) : !context.sidebarCollapsed;
  root.dataset.sidebarCollapsed = String(Boolean(context.sidebarCollapsed));
  root.dataset.menuOpen = String(phone && open);
  modalState(aside, phone, open, sidebarCopy(context));
  root.querySelector('[data-sidebar-toggle]')?.setAttribute('aria-expanded', String(open));
  for (const node of root.children) {
    if (!node.matches('.shell-sidebar, .sidebar-backdrop')) node.inert = phone && open;
  }
  sectionAvailability(root, aside);
}

function close(context, restoreFocus = true) {
  if (mobile()) context.menuOpen = false;
  else context.sidebarCollapsed = true;
  syncSidebar(context);
  if (restoreFocus) context.root.querySelector('[data-sidebar-toggle]')?.focus({ preventScroll: true });
}

function visitSection(context, button) {
  const target = context.root.querySelector('.shell-main').querySelector(button.dataset.sidebarTarget);
  if (!target) return;
  target.dispatchEvent(new Event('daily:show-section'));
  if (mobile()) close(context, false);
  if (target instanceof HTMLDetailsElement) target.open = true;
  target.scrollIntoView({ block: 'start' });
  const focus = target.querySelector('h1, h2, summary') ?? target;
  if (focus.tagName !== 'SUMMARY') focus.tabIndex = -1;
  focus.focus({ preventScroll: true });
  for (const node of context.root.querySelectorAll('[data-sidebar-target]')) node.removeAttribute('aria-current');
  button.setAttribute('aria-current', 'location');
}

function visitLink(event, context) {
  const link = event.target.closest('.shell-sidebar a[href]');
  if (!link) return false;
  if (mobile()) close(context, false);
  if (new URL(link.href).hash !== location.hash) return false;
  event.preventDefault();
  context.root.querySelector('.shell-main h1, .shell-main')?.focus({ preventScroll: true });
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  return true;
}

export function handleSidebarClick(event, context) {
  if (!(event.target instanceof Element)) return false;
  if (visitLink(event, context)) return true;
  const button = event.target.closest('[data-sidebar-toggle], [data-sidebar-close], [data-sidebar-target]');
  if (!button) return false;
  if (button.hasAttribute('data-sidebar-close')) close(context);
  else if (button.hasAttribute('data-sidebar-target')) visitSection(context, button);
  else {
    context.menuOpen = true;
    context.sidebarCollapsed = false;
    syncSidebar(context);
    if (mobile()) context.root.querySelector('.shell-sidebar [data-sidebar-close]')?.focus();
  }
  return true;
}

function keyboard(event, context) {
  if (!mobile() || !context.menuOpen) return;
  if (event.key === 'Escape') { event.preventDefault(); close(context); return; }
  if (event.key !== 'Tab') return;
  const nodes = [...context.root.querySelector('.shell-sidebar').querySelectorAll('a[href], button:not(:disabled)')];
  const first = nodes[0];
  const last = nodes.at(-1);
  const boundary = event.shiftKey ? first : last;
  const destination = event.shiftKey ? last : first;
  if (document.activeElement === boundary) { event.preventDefault(); destination.focus(); }
}

export function watchSidebar(context) {
  const keydown = event => keyboard(event, context);
  const scheme = matchMedia('(max-width: 899px)');
  const resize = () => { context.menuOpen = false; syncSidebar(context); };
  const refresh = () => syncSidebar(context);
  context.root.addEventListener('keydown', keydown);
  document.addEventListener('daily:form-state', refresh);
  scheme.addEventListener('change', resize);
  return () => { context.root.removeEventListener('keydown', keydown); document.removeEventListener('daily:form-state', refresh); scheme.removeEventListener('change', resize); };
}
