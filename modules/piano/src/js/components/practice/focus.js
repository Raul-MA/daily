export function rememberDisclosures(context) {
  for (const [name, property] of [['duration', 'customDurationOpen'], ['pacing', 'pacingOpen'], ['review', 'reviewOpen']]) {
    const details = context.container.querySelector(`[data-disclosure="${name}"]`);
    if (details) context[property] = details.open;
  }
}
export function captureFocus(container) {
  const active = document.activeElement;
  if (!container.contains(active)) return { hadFocus: false };
  if (active.matches('summary')) return { hadFocus: true, selector: `[data-disclosure="${active.parentElement.dataset.disclosure}"] > summary` };
  const action = active.dataset.action;
  const choices = [['data-action', action], ['name', active.name], ['data-minutes', active.dataset.minutes], ['data-pace', active.dataset.pace]];
  const selection = choices.find(([, value]) => value);
  return { hadFocus: true, action, selector: selection ? `[${selection[0]}="${CSS.escape(selection[1])}"]` : null };
}
export function restoreFocus(context, focus, force) {
  if (!focus.hadFocus && !force) return;
  const replacement = !force && focus.selector ? context.container.querySelector(focus.selector) : null;
  const answer = focus.action === 'reveal' ? context.container.querySelector('.practice-answer') : null;
  const target = replacement || answer || context.container.querySelector('h1');
  target.focus();
}
