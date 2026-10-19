import { detailSection, withUnit } from './format.js';
import { tr } from './copy.js';

export function detailGrind(entry) {
  return detailSection(tr("sectionGrind"), tr("captionInput"), [
        [tr("labelDose"), withUnit(entry.grind.doseG, "g")],
        [tr("labelDf54"), entry.grind.grindSetting]
      ]);
}
