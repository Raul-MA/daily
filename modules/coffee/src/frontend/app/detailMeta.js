import { detailSection, formatDate, formatBoolean } from './format.js';
import { tr } from './copy.js';
import { formatDrinkType } from './composition.js';

export function detailMeta(entry, bean) {
  return detailSection(tr("sectionMeta"), tr("captionBatch"), [
        [tr("labelDateTime"), formatDate(entry.meta.brewedAt)],
        [tr("labelDrinkType"), formatDrinkType(entry.brew.drinkType)],
        [tr("labelBeanBrand"), bean?.brand],
        [tr("labelBeanBlend"), bean?.blend],
        [tr("labelDecaf"), formatBoolean(bean?.decaf)],
        [tr("labelRoastOrigin"), bean?.roastOrigin],
        [tr("labelRoastDate"), entry.meta.roastDate],
        [tr("labelDaysOffRoast"), entry.meta.daysOffRoast]
      ]);
}
