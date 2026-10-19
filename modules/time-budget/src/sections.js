export function mountSections(app, ui) {
  const plan = document.createElement('div');
  plan.dataset.menuPanel = 'plan';
  const shell = app.host.querySelector('.app-shell');
  plan.append(app.dom.getElementById('time-setup'), app.dom.getElementById('timerScreen'));
  shell.append(plan);
  const countdowns = app.host.querySelector('.time-countdowns');
  countdowns.dataset.menuPanel = 'countdowns';
  const settings = app.host.querySelector('.time-backup');
  settings.dataset.menuPanel = 'settings';
  const heading = document.createElement('h1');
  heading.textContent = app.language === 'es' ? 'Ajustes' : 'Settings';
  settings.prepend(heading);
  const panels = [plan, countdowns, settings];
  const select = panel => {
    ui.section = panel.dataset.menuPanel;
    for (const node of panels) node.hidden = node !== panel;
  };
  for (const panel of panels) panel.addEventListener('daily:show-section', () => select(panel));
  select(panels.find(panel => panel.dataset.menuPanel === ui.section) ?? plan);
}
