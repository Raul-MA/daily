import { entryValue } from './values.js';
import { section, fieldRow, textarea, sliderInput } from '../components/components.js';
import { tr } from './copy.js';
import { quickTag } from './taste.js';

export function formTaste(entry, options) {
  return section(tr("sectionTaste"), `
        ${fieldRow({ id: "tastingNotes", label: tr("labelTastingNotes"), control: textarea({ id: "tastingNotes", value: entryValue(entry, "taste", "tastingNotes", "") }) })}
        ${quickTag("sweetness", tr("labelSweetness"), entryValue(entry, "taste", "sweetness"), options.triad)}
        ${quickTag("acidity", tr("labelAcidity"), entryValue(entry, "taste", "acidity"), options.triad)}
        ${quickTag("bitterness", tr("labelBitterness"), entryValue(entry, "taste", "bitterness"), options.triad)}
        ${quickTag("body", tr("labelBody"), entryValue(entry, "taste", "body"), options.body)}
        ${quickTag("aftertasteDuration", tr("labelAftertasteDuration"), entryValue(entry, "taste", "aftertasteDuration"), options.duration)}
        ${quickTag("aftertasteQuality", tr("labelAftertasteQuality"), entryValue(entry, "taste", "aftertasteQuality"), options.quality)}
        ${quickTag("balance", tr("labelBalance"), entryValue(entry, "taste", "balance"), options.balance)}
        ${fieldRow({ id: "overallScore", label: tr("labelOverallScore"), control: sliderInput({ id: "overallScore", value: entryValue(entry, "taste", "overallScore", ""), skipLabel: tr("buttonSkip") }) })}
        ${fieldRow({ id: "freeNotes", label: tr("labelFreeNotes"), control: textarea({ id: "freeNotes", value: entryValue(entry, "taste", "freeNotes", "") }) })}
      `, tr("captionCup"));
}
