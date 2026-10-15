import { createId } from '../core/id.js';
import { SCHEMA_VERSION } from '../core/schema.js';
import { numberOrNull, calculateRatio, calculateCompositionRatio, calculateDaysOffRoast, field } from './entry-math.js';

function meta(input, existing, timestamp) {
  const brewedAt = input?.brewedAt || existing?.brewedAt || timestamp;
  const roastDate = field(input, existing, 'roastDate', null);
  return { brewedAt, beanPresetId: field(input, existing, 'beanPresetId', ''), roastDate: roastDate || null, daysOffRoast: calculateDaysOffRoast(roastDate, brewedAt) };
}
function grind(input, existing) {
  return { doseG: numberOrNull(field(input, existing, 'doseG')), grindSetting: numberOrNull(field(input, existing, 'grindSetting')) };
}
function prep(input, existing) {
  return {
    wdtUsed: field(input, existing, 'wdtUsed', true), distributorUsed: field(input, existing, 'distributorUsed', false),
    distributorPasses: numberOrNull(field(input, existing, 'distributorPasses')), tampDeviation: field(input, existing, 'tampDeviation', 'consistent'),
    puckScreenUsed: field(input, existing, 'puckScreenUsed', false), puckScreenCondition: field(input, existing, 'puckScreenCondition', null),
  };
}
function composition(input, existing, drinkType) {
  const milk = ['flat_white', 'cappuccino', 'latte', 'cortado', 'macchiato'].includes(drinkType);
  return {
    waterMl: drinkType === 'americano' ? numberOrNull(field(input, existing, 'waterMl')) : null,
    milkMl: milk ? numberOrNull(field(input, existing, 'milkMl')) : null,
    milkBrand: milk ? field(input, existing, 'milkBrand', '') : '', milkType: milk ? field(input, existing, 'milkType', '') : '',
  };
}
function brew(input, existing, doseG) {
  const drinkType = field(input, existing, 'drinkType', 'espresso');
  const additions = composition(input, existing, drinkType);
  const yieldValue = numberOrNull(field(input, existing, 'yieldValue'));
  return {
    drinkType, shotTimeSeconds: numberOrNull(field(input, existing, 'shotTimeSeconds')), yieldValue,
    yieldUnit: field(input, existing, 'yieldUnit', 'g'), ratio: calculateRatio(doseG, yieldValue), ...additions,
    compositionRatio: calculateCompositionRatio(drinkType === 'americano' ? additions.waterMl : additions.milkMl, yieldValue),
  };
}
function tasteValue(input, existing, key) {
  return Object.hasOwn(input || {}, key) ? input[key] : existing?.[key] ?? null;
}
function taste(input, existing) {
  const keys = ['sweetness', 'acidity', 'bitterness', 'body', 'aftertasteDuration', 'aftertasteQuality', 'balance'];
  const values = Object.fromEntries(keys.map(key => [key, tasteValue(input, existing, key)]));
  return { tastingNotes: field(input, existing, 'tastingNotes', ''), ...values, overallScore: numberOrNull(field(input, existing, 'overallScore')), freeNotes: field(input, existing, 'freeNotes', '') };
}
export function normalizeEntry(input, existing = {}) {
  const timestamp = new Date().toISOString();
  const ground = grind(input.grind, existing.grind);
  return {
    id: existing.id || input.id || createId(), schemaVersion: SCHEMA_VERSION, createdAt: existing.createdAt || timestamp, updatedAt: timestamp,
    meta: meta(input.meta, existing.meta, timestamp), grind: ground, prep: prep(input.prep, existing.prep), brew: brew(input.brew, existing.brew, ground.doseG),
    visual: { colorDescription: field(input.visual, existing.visual, 'colorDescription', ''), cremaDescription: field(input.visual, existing.visual, 'cremaDescription', '') },
    taste: taste(input.taste, existing.taste),
  };
}
