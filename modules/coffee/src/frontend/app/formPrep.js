import { entryValue } from './values.js';
import { section, fieldRow, toggle, numberInput, selectInput } from '../components/components.js';
import { tr } from './copy.js';

export function formPrep(entry, settings) {
  return section(tr("sectionPrep"), `
        ${settings.tools.wdt ? fieldRow({ id: "wdtUsed", label: tr("labelWdtUsed"), control: toggle({ id: "wdtUsed", checked: entryValue(entry, "prep", "wdtUsed", true) }) }) : ""}
        ${settings.tools.distributor ? fieldRow({ id: "distributorUsed", label: tr("labelDistributorUsed"), control: toggle({ id: "distributorUsed", checked: entryValue(entry, "prep", "distributorUsed", false) }) }) : ""}
        ${settings.tools.distributor ? fieldRow({ id: "distributorPasses", label: tr("labelDistributorPasses"), control: numberInput({ id: "distributorPasses", value: entryValue(entry, "prep", "distributorPasses", ""), step: "1", min: "0" }) }) : ""}
        ${fieldRow({ id: "tampDeviation", label: tr("labelTampDeviation"), control: selectInput({ id: "tampDeviation", value: entryValue(entry, "prep", "tampDeviation", "consistent"), options: [
          { value: "consistent", label: tr("optionConsistent") },
          { value: "harder", label: tr("optionHarder") },
          { value: "softer", label: tr("optionSofter") }
        ] }) })}
        ${settings.tools.puckScreen ? fieldRow({ id: "puckScreenUsed", label: tr("labelPuckScreen"), control: toggle({ id: "puckScreenUsed", checked: entryValue(entry, "prep", "puckScreenUsed", false) }) }) : ""}
        ${settings.tools.puckScreen ? fieldRow({ id: "puckScreenCondition", label: tr("labelScreenCondition"), control: selectInput({ id: "puckScreenCondition", value: entryValue(entry, "prep", "puckScreenCondition", ""), options: [
          { value: "", label: tr("buttonSkip") },
          { value: "clean_new", label: tr("optionCleanNew") },
          { value: "stained", label: tr("optionStained") }
        ] }) }) : ""}
      `, tr("captionWorkflow"));
}
