import { detailSection, withUnit, formatRatio } from './format.js';
import { tr } from './copy.js';
import { compositionDetailItems } from './composition.js';

export function detailBrew(entry) {
  return detailSection(tr("sectionBrew"), tr("captionOutput"), [
        [tr("labelShotTime"), withUnit(entry.brew.shotTimeSeconds, "sec")],
        [tr("labelYield"), entry.brew.yieldValue],
        [tr("labelYieldUnit"), entry.brew.yieldUnit],
        [tr("labelCalculatedRatio"), formatRatio(entry.brew.ratio)],
        ...compositionDetailItems(entry)
      ]);
}
