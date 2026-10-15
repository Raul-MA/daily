import { detailSection, formatBoolean, formatEnum } from './format.js';
import { tr } from './copy.js';

export function detailPrep(entry) {
  return detailSection(tr("sectionPrep"), tr("captionWorkflow"), [
        [tr("labelWdtUsed"), formatBoolean(entry.prep.wdtUsed)],
        [tr("labelDistributorUsed"), formatBoolean(entry.prep.distributorUsed)],
        [tr("labelDistributorPasses"), entry.prep.distributorPasses],
        [tr("labelTampDeviation"), formatEnum(entry.prep.tampDeviation, {
          consistent: tr("optionConsistent"),
          harder: tr("optionHarder"),
          softer: tr("optionSofter")
        })],
        [tr("labelPuckScreenUsed"), formatBoolean(entry.prep.puckScreenUsed)],
        [tr("labelScreenCondition"), formatEnum(entry.prep.puckScreenCondition, {
          clean_new: tr("optionCleanNew"),
          stained: tr("optionStained")
        })]
      ]);
}
