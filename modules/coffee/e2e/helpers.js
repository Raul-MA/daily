import { appURL } from '../../../tests/support/app-url.mjs';
import { entryFixture } from './entry-fixture.js';
import { expect } from "@playwright/test";
import { testIds } from "./testIds.js";
export const STORAGE_KEY = "coffee-tracker:v1";
export { testIds };
export const fieldIds = {
    beanDecaf: "beanDecaf",
    distributorUsed: "distributorUsed",
    puckScreenUsed: "puckScreenUsed",
    toolDistributor: "tool-distributor",
    toolPuckScreen: "tool-puckScreen",
    toolWdt: "tool-wdt",
    wdtUsed: "wdtUsed"
};
export const selectors = {
    beanBlend: "#beanBlend",
    beanBrand: "#beanBrand",
    beanOrigin: "#beanOrigin",
    beanSearch: "#beanSearch",
    brewedAt: "#brewedAt",
    burrTouchReference: "#burrTouchReference",
    colorDescription: "#colorDescription",
    compositionRatioPreview: "#composition-ratio-preview",
    cremaDescription: "#cremaDescription",
    distributorPasses: "#distributorPasses",
    distributorTool: `#${fieldIds.toolDistributor}`,
    distributorUsed: `#${fieldIds.distributorUsed}`,
    doseG: "#doseG",
    drinkType: "#drinkType",
    endDate: "#endDate",
    filterBean: "#filterBean",
    filterDrinkType: "#filterDrinkType",
    freeNotes: "#freeNotes",
    grindSetting: "#grindSetting",
    html: "html",
    importMode: "#importMode",
    language: "#language",
    milkBrand: "#milkBrand",
    milkMl: "#milkMl",
    milkType: "#milkType",
    overallScore: "#overallScore",
    puckScreenCondition: "#puckScreenCondition",
    puckScreenUsed: `#${fieldIds.puckScreenUsed}`,
    roastDate: "#roastDate",
    scoreMin: "#scoreMin",
    shotTimeSeconds: "#shotTimeSeconds",
    sortBy: "#sortBy",
    startDate: "#startDate",
    tampDeviation: "#tampDeviation",
    tastingNotes: "#tastingNotes",
    theme: "#theme",
    acidityMedium: "label[for='acidity-medium']",
    aftertasteDurationLingering: "label[for='aftertasteDuration-lingering']",
    aftertasteQualityPleasant: "label[for='aftertasteQuality-pleasant']",
    balanceBalanced: "label[for='balance-balanced']",
    bitternessLow: "label[for='bitterness-low']",
    bodyHeavy: "label[for='body-heavy']",
    sweetnessHigh: "label[for='sweetness-high']",
    waterMl: "#waterMl",
    wdtTool: `#${fieldIds.toolWdt}`,
    wdtUsed: `#${fieldIds.wdtUsed}`,
    yieldUnit: "#yieldUnit",
    yieldValue: "#yieldValue"
};
export function appLocators(page) {
    return Object.fromEntries(Object.entries(selectors).map(([name, selector]) => [name, page.locator(selector)]));
}
export function emptyData(overrides = {}) {
    return {
        schemaVersion: 1,
        entries: [],
        beanPresets: [],
        settings: {
            theme: "system",
            language: "en",
            burrTouchReference: "",
            defaultYieldUnit: "g",
            historyListView: "compact",
            toolsConfigured: true,
            tools: {
                wdt: true,
                distributor: true,
                puckScreen: true
            }
        },
        ...overrides
    };
}
export function bean(overrides = {}) {
    return {
        id: "bean-house",
        schemaVersion: 1,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
        brand: "House",
        blend: "First Dial-In",
        decaf: false,
        roastOrigin: "Starter preset",
        ...overrides
    };
}
export function entry(overrides = {}) {
    const base = entryFixture;
    return {
        ...base,
        ...overrides,
        meta: { ...base.meta, ...overrides.meta },
        grind: { ...base.grind, ...overrides.grind },
        prep: { ...base.prep, ...overrides.prep },
        brew: { ...base.brew, ...overrides.brew },
        visual: { ...base.visual, ...overrides.visual },
        taste: { ...base.taste, ...overrides.taste }
    };
}
export async function seedStorage(page, data) {
    await page.evaluate(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)), { key: STORAGE_KEY, value: data });
}
export async function gotoApp(page, data = emptyData({ beanPresets: [bean()] })) {
    await page.goto(appURL("coffee"));
    await seedStorage(page, data);
    await page.reload();
}
export async function expectToast(page, text) {
    await expect(page.getByTestId(testIds.toast)).toHaveText(text);
}
export async function fillShotForm(page, overrides = {}) {
    const fields = appLocators(page);
    const values = {
        brewedAt: "2026-01-10T09:15",
        roastDate: "2026-01-03",
        doseG: "18",
        grindSetting: "14.2",
        distributorPasses: "2",
        shotTimeSeconds: "29",
        yieldValue: "42",
        drinkType: "espresso",
        beanSearch: "House / First Dial-In",
        waterMl: "",
        milkMl: "",
        milkBrand: "",
        milkType: "",
        colorDescription: "amber",
        cremaDescription: "silky",
        tastingNotes: "brown sugar",
        freeNotes: "balanced finish",
        score: "8",
        ...overrides
    };
    if (values.beanSearch !== null) {
        await fields.beanSearch.fill(values.beanSearch);
        await fields.beanSearch.dispatchEvent("change");
    }
    await fields.brewedAt.fill(values.brewedAt);
    await fields.roastDate.fill(values.roastDate);
    await fields.drinkType.selectOption(values.drinkType);
    await fields.doseG.fill(values.doseG);
    await fields.grindSetting.fill(values.grindSetting);
    await fillPreparation(page, fields, values);
    await fields.shotTimeSeconds.fill(values.shotTimeSeconds);
    await fields.yieldValue.fill(values.yieldValue);
    await fields.yieldUnit.selectOption("ml");
    await fillComposition(fields, values);
    await fields.colorDescription.fill(values.colorDescription);
    await fields.cremaDescription.fill(values.cremaDescription);
    await fields.tastingNotes.fill(values.tastingNotes);
    await fields.sweetnessHigh.click();
    await fields.acidityMedium.click();
    await fields.bitternessLow.click();
    await fields.bodyHeavy.click();
    await fields.aftertasteDurationLingering.click();
    await fields.aftertasteQualityPleasant.click();
    await fields.balanceBalanced.click();
    await fields.overallScore.fill(values.score);
    await fields.overallScore.dispatchEvent("input");
    await fields.freeNotes.fill(values.freeNotes);
}
export async function createShotThroughUi(page, overrides) {
    await page.getByTestId(testIds.navNew).click();
    await fillShotForm(page, overrides);
    await page.getByTestId(testIds.saveShot).click();
    await expectToast(page, "Drink saved.");
    await expect(page.getByTestId(testIds.entryDetail)).toBeVisible();
}
export async function setToggle(page, id, checked) {
    const input = page.locator(`#${id}`);
    if ((await input.isChecked()) !== checked) {
        await page.locator(`label.toggle[for='${id}']`).click();
    }
    await expect(input).toBeChecked({ checked });
}
async function fillPreparation(page, fields, values) {
    if (await fields.wdtUsed.count())
        await setToggle(page, fieldIds.wdtUsed, false);
    if (await fields.distributorUsed.count())
        await setToggle(page, fieldIds.distributorUsed, true);
    if (await fields.distributorPasses.count())
        await fields.distributorPasses.fill(values.distributorPasses);
    await fields.tampDeviation.selectOption("harder");
    if (await fields.puckScreenUsed.count())
        await setToggle(page, fieldIds.puckScreenUsed, true);
    if (await fields.puckScreenCondition.count())
        await fields.puckScreenCondition.selectOption("clean_new");
}
async function fillComposition(fields, values) {
    if (values.waterMl !== "")
        await fields.waterMl.fill(values.waterMl);
    if (values.milkMl !== "")
        await fields.milkMl.fill(values.milkMl);
    if (values.milkBrand !== "")
        await fields.milkBrand.fill(values.milkBrand);
    if (values.milkType !== "")
        await fields.milkType.fill(values.milkType);
}
