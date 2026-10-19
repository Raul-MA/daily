import { drinkTypes } from './constants.js';
import { tr } from './copy.js';
import { withUnit, formatCompositionRatio, formatRatio } from './format.js';
import { coffee } from './context.js';

export function getDrinkConfig(drinkType) {
  return drinkTypes.find((type) => type.value === drinkType) || drinkTypes[0];
}

export function formatDrinkType(drinkType) {
  const config = getDrinkConfig(drinkType || "espresso");
  return config ? tr(config.labelKey) : drinkType || tr("drinkEspresso");
}

export function getCompositionKind(drinkType) {
  return getDrinkConfig(drinkType).addIn;
}

export function compositionDetailItems(entry) {
  const kind = getCompositionKind(entry.brew.drinkType);
  if (kind === "water") {
    return [
      [tr("labelWater"), withUnit(entry.brew.waterMl, "ml")],
      [tr("labelWaterCoffee"), formatCompositionRatio(entry.brew.compositionRatio)]
    ];
  }
  if (kind === "milk") {
    return [
      [tr("labelMilk"), withUnit(entry.brew.milkMl, "ml")],
      [tr("labelMilkBrand"), entry.brew.milkBrand],
      [tr("labelMilkType"), entry.brew.milkType],
      [tr("labelMilkCoffee"), formatCompositionRatio(entry.brew.compositionRatio)]
    ];
  }
  return [];
}

export function updateCompositionFields() {
  const kind = getCompositionKind(coffee.host.querySelector("#drinkType")?.value || "espresso");
  coffee.host.querySelectorAll("[data-composition-field]").forEach((row) => {
    row.hidden = row.dataset.compositionField !== kind;
  });
  const previewRow = coffee.host.querySelector("#composition-preview-row");
  if (previewRow) previewRow.hidden = !kind;
  const label = coffee.host.querySelector("#composition-ratio-label");
  if (label) label.textContent = kind === "water" ? tr("labelWaterCoffee") : tr("labelMilkCoffee");
  updateCompositionRatioPreview();
}

export function updateRatioPreview() {
  const dose = Number(coffee.host.querySelector("#doseG")?.value);
  const output = Number(coffee.host.querySelector("#yieldValue")?.value);
  const ratio = dose > 0 && output > 0 ? Number((output / dose).toFixed(2)) : null;
  const preview = coffee.host.querySelector("#ratio-preview");
  if (preview) preview.textContent = formatRatio(ratio);
  updateCompositionRatioPreview();
}

export function updateCompositionRatioPreview() {
  const kind = getCompositionKind(coffee.host.querySelector("#drinkType")?.value || "espresso");
  const output = Number(coffee.host.querySelector("#yieldValue")?.value);
  const addIn = Number(coffee.host.querySelector(kind === "water" ? "#waterMl" : "#milkMl")?.value);
  const ratio = compositionRatio(kind, output, addIn);
  const preview = coffee.host.querySelector("#composition-ratio-preview");
  if (preview) preview.textContent = formatCompositionRatio(ratio);
}

function compositionRatio(kind, output, addIn) { return kind && output > 0 && addIn > 0 ? Number((addIn / output).toFixed(2)) : null; }
