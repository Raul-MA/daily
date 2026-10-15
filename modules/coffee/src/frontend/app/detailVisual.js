import { detailSection } from './format.js';
import { tr } from './copy.js';

export function detailVisual(entry) {
  return detailSection(tr("sectionVisual"), tr("captionLook"), [
        [tr("labelColorDescription"), entry.visual.colorDescription],
        [tr("labelCremaDescription"), entry.visual.cremaDescription]
      ]);
}
