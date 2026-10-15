import { SCHEMA_VERSION } from './schema.js';

const tasteEnums = {
  sweetness: ['low', 'medium', 'high', null], acidity: ['low', 'medium', 'high', null], bitterness: ['low', 'medium', 'high', null],
  body: ['thin', 'medium', 'heavy', null], aftertasteDuration: ['short', 'lingering', null], aftertasteQuality: ['pleasant', 'harsh', null], balance: ['sour', 'balanced', 'bitter', null],
};
const drinkTypes = ['espresso', 'americano', 'flat_white', 'cappuccino', 'latte', 'cortado', 'macchiato'];
function isObject(value) { return value && typeof value === 'object' && !Array.isArray(value); }
function isOptionalNumber(value) { return value === null || value === undefined || value === '' || Number.isFinite(Number(value)); }
function isSafeId(value) { return typeof value === 'string' && /^[A-Za-z0-9_-]+$/.test(value); }
function nonempty(value) { return typeof value === 'string' && value.trim().length > 0; }
function errorsFor(rules) { return rules.filter(([valid]) => !valid).map(([, message]) => message); }

export function validateBeanPreset(bean) {
  if (!isObject(bean)) return ['Bean preset must be an object.'];
  return errorsFor([
    [isSafeId(bean.id), 'Bean preset requires a safe id.'], [nonempty(bean.brand), 'Bean preset requires a brand.'],
    [nonempty(bean.blend), 'Bean preset requires a blend.'], [typeof bean.decaf === 'boolean', 'Bean preset decaf must be boolean.'],
  ]);
}
function identityErrors(entry) {
  return errorsFor([[isSafeId(entry.id), 'Entry requires a safe id.'], [Boolean(entry.meta?.brewedAt), 'Entry requires a brewed date.'], [isSafeId(entry.meta?.beanPresetId), 'Entry requires a safe bean preset id.']]);
}
function numericErrors(entry, fields) {
  return errorsFor(fields.map(([group, key, label]) => [isOptionalNumber(entry[group]?.[key]), `${label} must be numeric.`]));
}
function brewErrors(entry) {
  const brew = entry.brew || {};
  return errorsFor([[['g', 'ml'].includes(brew.yieldUnit), 'Yield unit must be g or ml.'], [brew.drinkType === undefined || drinkTypes.includes(brew.drinkType), 'Drink type is unsupported.']]);
}
function tasteErrors(entry) {
  const errors = [];
  for (const [key, values] of Object.entries(tasteEnums)) {
    if (!values.includes(entry.taste?.[key])) errors.push(`${key} has an unsupported value.`);
  }
  return errors;
}
function scoreErrors(score) {
  const invalid = score !== null && score !== '' && (!Number.isFinite(Number(score)) || Number(score) < 1 || Number(score) > 10);
  return invalid ? ['Overall score must be from 1 to 10.'] : [];
}
export function validateEntry(entry) {
  if (!isObject(entry)) return ['Entry must be an object.'];
  const groups = ['meta', 'grind', 'prep', 'brew', 'visual', 'taste'];
  if (!groups.every(group => isObject(entry[group]))) return ['Entry fields must be objects.'];
  if (typeof entry.meta.brewedAt !== 'string' || !Number.isFinite(Date.parse(entry.meta.brewedAt))) return ['Entry requires a valid brewed date.'];
  const numeric = [['grind', 'doseG', 'Dose'], ['grind', 'grindSetting', 'Grind setting'], ['brew', 'shotTimeSeconds', 'Shot time'], ['brew', 'yieldValue', 'Yield']];
  const addIns = [['brew', 'waterMl', 'Water ml'], ['brew', 'milkMl', 'Milk ml']];
  return [...identityErrors(entry), ...numericErrors(entry, numeric), ...brewErrors(entry), ...numericErrors(entry, addIns), ...tasteErrors(entry), ...scoreErrors(entry.taste?.overallScore)];
}
export function validateBackup(data) {
  if (!isObject(data)) return ['Backup must be a JSON object.'];
  const errors = [];
  if (data.schemaVersion !== SCHEMA_VERSION) errors.push(`Unsupported schema version: ${data.schemaVersion}.`);
  if (!Array.isArray(data.entries)) errors.push('Backup entries must be an array.');
  if (!Array.isArray(data.beanPresets)) errors.push('Backup beanPresets must be an array.');
  appendRecords(errors, data.beanPresets, 'beanPresets', validateBeanPreset);
  appendRecords(errors, data.entries, 'entries', validateEntry);
  return errors;
}
function appendRecords(errors, values, name, validate) {
  if (!Array.isArray(values)) return;
  values.forEach((value, index) => {
    for (const error of validate(value)) errors.push(`${name}[${index}]: ${error}`);
  });
}
