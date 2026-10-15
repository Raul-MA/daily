import { detailSection, formatEnum } from './format.js';
import { tr } from './copy.js';

export function detailTaste(entry) {
  return detailSection(tr("sectionTaste"), tr("captionCup"), [
        [tr("labelTastingNotes"), entry.taste.tastingNotes],
        [tr("labelSweetness"), formatEnum(entry.taste.sweetness, {
          low: tr("optionLow"),
          medium: tr("optionMedium"),
          high: tr("optionHigh")
        })],
        [tr("labelAcidity"), formatEnum(entry.taste.acidity, {
          low: tr("optionLow"),
          medium: tr("optionMedium"),
          high: tr("optionHigh")
        })],
        [tr("labelBitterness"), formatEnum(entry.taste.bitterness, {
          low: tr("optionLow"),
          medium: tr("optionMedium"),
          high: tr("optionHigh")
        })],
        [tr("labelBody"), formatEnum(entry.taste.body, {
          thin: tr("optionThin"),
          medium: tr("optionMedium"),
          heavy: tr("optionHeavy")
        })],
        [tr("labelAftertasteDuration"), formatEnum(entry.taste.aftertasteDuration, {
          short: tr("optionShort"),
          lingering: tr("optionLingering")
        })],
        [tr("labelAftertasteQuality"), formatEnum(entry.taste.aftertasteQuality, {
          pleasant: tr("optionPleasant"),
          harsh: tr("optionHarsh")
        })],
        [tr("labelBalance"), formatEnum(entry.taste.balance, {
          sour: tr("optionSourLeaning"),
          balanced: tr("optionBalanced"),
          bitter: tr("optionBitterLeaning")
        })],
        [tr("labelOverallScore"), entry.taste.overallScore],
        [tr("labelFreeNotes"), entry.taste.freeNotes]
      ]);
}
