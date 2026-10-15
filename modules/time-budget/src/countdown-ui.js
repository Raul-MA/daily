import { activityTime } from '../../../packages/platform/src/activities.js';

function format(value) {
  const seconds = Math.floor(Math.abs(value) / 1000);
  const clock = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  return value < 0 ? `+${clock}` : clock;
}
function button(label, action) {
  const node = document.createElement('button');
  node.type = 'button';
  node.className = 'button secondary compact';
  node.textContent = label;
  node.onclick = action;
  return node;
}
function card(item, app, render) {
  const node = document.createElement('div');
  node.className = 'countdown-card';
  node.dataset.countdown = item.id;
  const name = document.createElement('strong');
  name.textContent = item.label;
  const time = document.createElement('output');
  node.append(name, time);
  const change = status => {
    try { app.service.countdowns.transition(item.id, status); render(); }
    catch (error) { app.notify(error.message); }
  };
  if (item.status === 'completed') node.append('Completed');
  else {
    node.append(button(item.status === 'running' ? 'Pause' : 'Resume', () => change(item.status === 'running' ? 'paused' : 'running')));
    node.append(button('Complete', () => change('completed')));
  }
  return node;
}
export function mountCountdowns(app) {
  const section = document.createElement('section');
  section.className = 'panel time-countdowns';
  section.innerHTML = '<h2>Countdowns</h2><form id="time-countdown"><label>Countdown name<input name="label" maxlength="120" required></label><label>Countdown minutes<input name="minutes" type="number" inputmode="numeric" min="1" max="1440" value="5" required></label><button type="submit" class="button primary">Start countdown</button></form><div data-countdown-list></div>';
  const list = section.querySelector('[data-countdown-list]');
  function update() {
    for (const item of app.service.countdowns.list()) {
      const output = list.querySelector(`[data-countdown="${CSS.escape(item.id)}"] output`);
      if (output) output.textContent = format(activityTime(item, Date.now()).remainingMs);
    }
  }
  function render() { list.replaceChildren(...app.service.countdowns.list().map(item => card(item, app, render))); update(); }
  const form = section.querySelector('form');
  form.onsubmit = event => {
    event.preventDefault();
    try {
      app.service.countdowns.start(form.elements.label.value, Number(form.elements.minutes.value));
      form.elements.label.value = '';
      delete form.dataset.unsaved;
      render();
      document.dispatchEvent(new Event('daily:form-state'));
    } catch (error) { app.notify(error.message); }
  };
  form.dataset.expected = JSON.stringify(app.documentData);
  app.host.append(section);
  render();
  const interval = setInterval(update, 1000);
  return () => clearInterval(interval);
}
