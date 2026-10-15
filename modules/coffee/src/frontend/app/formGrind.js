import { entryValue } from './values.js';
import { section, fieldRow, numberInput } from '../components/components.js';
import { tr } from './copy.js';

export function formGrind(entry) {
  return section(tr("sectionGrind"), `
        ${fieldRow({ id: "doseG", label: tr("labelDose"), control: numberInput({ id: "doseG", value: entryValue(entry, "grind", "doseG", ""), step: "0.1", min: "0", unit: "g" }) })}
        ${fieldRow({ id: "grindSetting", label: tr("labelDf54"), control: numberInput({ id: "grindSetting", value: entryValue(entry, "grind", "grindSetting", ""), step: "0.1" }) })}
      `, tr("captionInput"));
}
