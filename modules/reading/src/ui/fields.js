const locationIds = { new: 'New', later: 'Later', shortlist: 'Shortlist' };
const switches = ['updateUrlOnPick', 'autoOpenSingle', 'rememberLastItem', 'includeUnknown'];
export function field(context, id) { return context.host.querySelector(`#${id}`); }
export function syncMain(context) {
  field(context, 'reader-controls').dataset.expected = JSON.stringify(context.service.read().settings);
  for (const item of [{ id: 'count', values: [1, 3, 5] }, { id: 'minutes', values: [0, 5, 10, 15, 20, 30] }]) {
    const custom = !item.values.includes(context.config[item.id]);
    field(context, `${item.id}Input`).value = custom ? 'custom' : String(context.config[item.id]);
    const title = item.id === 'count' ? 'Count' : 'Minutes';
    field(context, `custom${title}`).value = context.config[item.id];
    field(context, `custom${title}Label`).hidden = !custom;
  }
}
export function restoreOrder(form) {
  const order = JSON.parse(form.dataset.order ?? 'null');
  if (!Array.isArray(order)) return;
  const container = form.querySelector('#reader-location-order');
  for (const id of order) {
    const row = container.querySelector(`[data-location="${id}"]`);
    if (row) container.append(row);
  }
}
export function syncSettings(context) {
  const data = context.service.read();
  const form = field(context, 'settingsForm') ?? field(context, 'readerPreferencesForm');
  form.dataset.expected = JSON.stringify(data.settings);
  form.dataset.order = JSON.stringify([...data.settings.locations, ...Object.keys(locationIds).filter(id => !data.settings.locations.includes(id))]);
  for (const [value, id] of Object.entries(locationIds)) field(context, `location${id}`).checked = data.settings.locations.includes(value);
  for (const id of switches) field(context, id).checked = data.settings[id];
  for (const [id, key] of [['progressInput', 'progress'], ['cacheMinutesInput', 'cacheMinutes'], ['scanLimitInput', 'scanLimit'], ['policyInput', 'policy']]) field(context, id).value = data.settings[key];
  restoreOrder(form);
}
export function readSettings(context) {
  const data = context.service.read();
  const form = field(context, 'settingsForm') ?? field(context, 'readerPreferencesForm');
  if (form.dataset.expected !== JSON.stringify(data.settings)) throw new Error('Data changed in another view. Your draft has been kept.');
  const locations = Array.from(context.host.querySelectorAll('[data-location]')).filter(row => row.querySelector('input').checked).map(row => row.dataset.location);
  const settings = { ...data.settings, locations };
  for (const id of switches) settings[id] = field(context, id).checked;
  for (const [id, key] of [['progressInput', 'progress'], ['policyInput', 'policy']]) settings[key] = field(context, id).value;
  for (const [id, key] of [['cacheMinutesInput', 'cacheMinutes'], ['scanLimitInput', 'scanLimit']]) settings[key] = Number(field(context, id).value);
  return settings;
}

export function restoreMain(context) {
  for (const key of ['Count', 'Minutes']) {
    const select = field(context, `${key.toLowerCase()}Input`);
    field(context, `custom${key}Label`).hidden = select.value !== 'custom';
  }
}
