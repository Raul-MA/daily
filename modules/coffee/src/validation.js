import { validateBackup } from './backend/core/validation.js';

function uniqueIds(records) { return new Set(records.map(record => record.id)).size === records.length; }
export function validateCoffeeRecords(data) {
  const errors = validateBackup(data);
  if (errors.length) return errors;
  if (!uniqueIds(data.entries) || !uniqueIds(data.beanPresets)) errors.push('Duplicate coffee record ids.');
  const beans = new Set(data.beanPresets.map(bean => bean.id));
  if (data.entries.some(entry => !beans.has(entry.meta.beanPresetId))) errors.push('Entry references a missing bean.');
  return errors;
}
function validSettings(settings) {
  if (!settings || typeof settings !== 'object' || !settings.tools) return false;
  return ['system', 'light', 'dark'].includes(settings.theme)
    && ['en', 'es'].includes(settings.language)
    && ['compact', 'detailed'].includes(settings.historyListView)
    && ['g', 'ml'].includes(settings.defaultYieldUnit)
    && validTools(settings);
}
function validTools(settings) {
  return typeof settings.toolsConfigured === 'boolean'
    && ['wdt', 'distributor', 'puckScreen'].every(key => typeof settings.tools[key] === 'boolean');
}
export function validateCoffee(data) {
  return validateCoffeeRecords(data).length === 0 && validSettings(data.settings);
}
