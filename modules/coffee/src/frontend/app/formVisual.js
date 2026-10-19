import { entryValue } from './values.js';
import { section, fieldRow, textInput } from '../components/components.js';
import { tr } from './copy.js';

export function formVisual(entry) {
  return section(tr("sectionVisual"), `
        ${fieldRow({ id: "colorDescription", label: tr("labelColorDescription"), control: textInput({ id: "colorDescription", value: entryValue(entry, "visual", "colorDescription", ""), placeholder: tr("placeholderColor") }) })}
        ${fieldRow({ id: "cremaDescription", label: tr("labelCremaDescription"), control: textInput({ id: "cremaDescription", value: entryValue(entry, "visual", "cremaDescription", ""), placeholder: tr("placeholderCrema") }) })}
      `, tr("captionLook"));
}
