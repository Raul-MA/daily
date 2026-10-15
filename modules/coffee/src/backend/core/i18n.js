import en from './translations/en.js';
import es from './translations/es.js';

export const dictionaries = { en, es };

const errorMessageKeys = {
  "Bean preset must be an object.": "validationBeanObject",
  "Bean preset requires a safe id.": "validationBeanSafeId",
  "Bean preset requires a brand.": "validationBeanBrand",
  "Bean preset requires a blend.": "validationBeanBlend",
  "Bean preset decaf must be boolean.": "validationBeanDecaf",
  "Entry must be an object.": "validationEntryObject",
  "Entry requires a safe id.": "validationEntrySafeId",
  "Entry requires a brewed date.": "validationEntryBrewedDate",
  "Entry requires a safe bean preset id.": "validationEntryBeanId",
  "Dose must be numeric.": "validationDoseNumeric",
  "Grind setting must be numeric.": "validationGrindNumeric",
  "Shot time must be numeric.": "validationShotTimeNumeric",
  "Yield must be numeric.": "validationYieldNumeric",
  "Yield unit must be g or ml.": "validationYieldUnit",
  "Drink type is unsupported.": "validationDrinkType",
  "Water ml must be numeric.": "validationWaterNumeric",
  "Milk ml must be numeric.": "validationMilkNumeric",
  "Overall score must be from 1 to 10.": "validationScoreRange",
  "Backup must be a JSON object.": "validationBackupObject",
  "Backup entries must be an array.": "validationBackupEntries",
  "Backup beanPresets must be an array.": "validationBackupBeans",
  "Bean preset not found.": "validationBeanNotFound",
  "This bean is used by entries and cannot be deleted.": "validationBeanInUse",
  "Entry not found.": "validationEntryNotFound"
};

export function getAvailableLanguages() {
  return Object.keys(dictionaries);
}

export function t(language, key, params = {}) {
  const template = dictionaries[language]?.[key] || dictionaries.en[key] || key;
  return Object.entries(params).reduce(
    (message, [name, value]) => message.replaceAll(`{${name}}`, String(value)),
    template
  );
}

export function translateMessage(language, message) {
  const text = String(message || "");
  const exactKey = errorMessageKeys[text];
  if (exactKey) return t(language, exactKey);

  const translated = Object.entries(errorMessageKeys).reduce(
    (result, [source, key]) => result.replaceAll(source, t(language, key)),
    text
  );

  return translated
    .replaceAll(/Unsupported schema version: ([^.]+)\./g, (_, version) => t(language, "validationUnsupportedSchema", { version }))
    .replaceAll(/([A-Za-z]+) has an unsupported value\./g, (_, field) => t(language, "validationTasteUnsupported", { field }))
    .replaceAll(/beanPresets\[(\d+)\]: ([^.]+\.)/g, (_, index, error) => `beanPresets[${index}]: ${translateMessage(language, error)}`)
    .replaceAll(/entries\[(\d+)\]: ([^.]+\.)/g, (_, index, error) => `entries[${index}]: ${translateMessage(language, error)}`);
}
