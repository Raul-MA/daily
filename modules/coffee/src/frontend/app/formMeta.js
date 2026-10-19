import { entryValue } from './values.js';
import { section, fieldRow, textInput, selectInput } from '../components/components.js';
import { tr, drinkTypeOptions } from './copy.js';
import { beanPicker } from './form.js';
import { toDatetimeLocal } from './format.js';

export function formMeta(entry, beans, drinkType) {
  return section(tr("sectionMeta"), `
        ${fieldRow({ id: "beanSearch", label: tr("labelBean"), control: beanPicker(beans, entryValue(entry, "meta", "beanPresetId", "")), hint: tr("hintBeanSearch") })}
        ${fieldRow({ id: "brewedAt", label: tr("labelDateTime"), control: textInput({ id: "brewedAt", type: "datetime-local", value: toDatetimeLocal(entryValue(entry, "meta", "brewedAt") || new Date().toISOString()) }) })}
        ${fieldRow({ id: "roastDate", label: tr("labelRoastDate"), control: textInput({ id: "roastDate", type: "date", value: entryValue(entry, "meta", "roastDate", "") }) })}
        ${fieldRow({ id: "drinkType", label: tr("labelDrinkType"), control: selectInput({ id: "drinkType", value: drinkType, options: drinkTypeOptions() }) })}
      `, tr("captionBatch"));
}
