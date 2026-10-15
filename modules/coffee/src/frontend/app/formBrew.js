import { entryValue } from './values.js';
import { section, fieldRow, numberInput, selectInput, textInput, escapeHtml } from '../components/components.js';
import { tr } from './copy.js';
import { testIds } from './testIds.js';
import { formatRatio, formatCompositionRatio } from './format.js';

export function formBrew(entry) {
  return section(tr("sectionBrew"), `
        ${fieldRow({ id: "shotTimeSeconds", label: tr("labelShotTime"), control: numberInput({ id: "shotTimeSeconds", value: entryValue(entry, "brew", "shotTimeSeconds", ""), step: "0.1", min: "0", unit: "sec" }) })}
        ${fieldRow({ id: "yieldValue", label: tr("labelYield"), control: numberInput({ id: "yieldValue", value: entryValue(entry, "brew", "yieldValue", ""), step: "0.1", min: "0" }) })}
        ${fieldRow({ id: "yieldUnit", label: tr("labelYieldUnit"), control: selectInput({ id: "yieldUnit", value: entryValue(entry, "brew", "yieldUnit", "g"), options: [
          { value: "g", label: "g" },
          { value: "ml", label: "ml" }
        ] }) })}
        ${fieldRow({ id: "waterMl", label: tr("labelWater"), control: numberInput({ id: "waterMl", value: entryValue(entry, "brew", "waterMl", ""), step: "0.1", min: "0", unit: "ml" }), attrs: `data-composition-field="water"` })}
        ${fieldRow({ id: "milkMl", label: tr("labelMilk"), control: numberInput({ id: "milkMl", value: entryValue(entry, "brew", "milkMl", ""), step: "0.1", min: "0", unit: "ml" }), attrs: `data-composition-field="milk"` })}
        ${fieldRow({ id: "milkBrand", label: tr("labelMilkBrand"), control: textInput({ id: "milkBrand", value: entryValue(entry, "brew", "milkBrand", "") }), attrs: `data-composition-field="milk"` })}
        ${fieldRow({ id: "milkType", label: tr("labelMilkType"), control: textInput({ id: "milkType", value: entryValue(entry, "brew", "milkType", ""), placeholder: tr("placeholderMilkType") }), attrs: `data-composition-field="milk"` })}
        <div class="derived"><span>${escapeHtml(tr("labelCalculatedRatio"))}</span><strong id="ratio-preview" data-testid="${testIds.ratioPreview}">${formatRatio(entryValue(entry, "brew", "ratio"))}</strong></div>
        <div class="derived" id="composition-preview-row"><span id="composition-ratio-label">${escapeHtml(tr("labelCompositionRatio"))}</span><strong id="composition-ratio-preview">${formatCompositionRatio(entryValue(entry, "brew", "compositionRatio"))}</strong></div>
      `, tr("captionOutput"));
}
