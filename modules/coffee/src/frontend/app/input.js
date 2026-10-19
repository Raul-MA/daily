import { getSettings } from '../../backend/features/settings.js';

export function readEntryForm(form) {
  const data = new FormData(form);
  const tools = getSettings().tools;
  return {
    meta: {
      beanPresetId: data.get("beanPresetId"),
      brewedAt: new Date(data.get("brewedAt")).toISOString(),
      roastDate: data.get("roastDate") || null
    },
    grind: {
      doseG: data.get("doseG"),
      grindSetting: data.get("grindSetting")
    },
    prep: readPrep(data, tools),
    brew: {
      drinkType: data.get("drinkType"),
      shotTimeSeconds: data.get("shotTimeSeconds"),
      yieldValue: data.get("yieldValue"),
      yieldUnit: data.get("yieldUnit"),
      waterMl: data.get("waterMl"),
      milkMl: data.get("milkMl"),
      milkBrand: data.get("milkBrand"),
      milkType: data.get("milkType")
    },
    visual: {
      colorDescription: data.get("colorDescription"),
      cremaDescription: data.get("cremaDescription")
    },
    taste: readTaste(data)
  };
}

export function readPrep(data, tools) {return {
      wdtUsed: tools.wdt && data.get("wdtUsed") === "on",
      distributorUsed: tools.distributor && data.get("distributorUsed") === "on",
      distributorPasses: tools.distributor ? data.get("distributorPasses") : null,
      tampDeviation: data.get("tampDeviation"),
      puckScreenUsed: tools.puckScreen && data.get("puckScreenUsed") === "on",
      puckScreenCondition: tools.puckScreen ? data.get("puckScreenCondition") || null : null
    };}

export function readTaste(data) {return {
      tastingNotes: data.get("tastingNotes"),
      sweetness: data.get("sweetness") || null,
      acidity: data.get("acidity") || null,
      bitterness: data.get("bitterness") || null,
      body: data.get("body") || null,
      aftertasteDuration: data.get("aftertasteDuration") || null,
      aftertasteQuality: data.get("aftertasteQuality") || null,
      balance: data.get("balance") || null,
      overallScore: data.get("overallScore"),
      freeNotes: data.get("freeNotes")
    };}
