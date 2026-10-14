import { expect, test } from "@playwright/test";
import { appLocators, bean, createShotThroughUi, emptyData, entry, expectToast, gotoApp, testIds } from "./helpers.js";
test("sorts, filters, opens, edits, cancels, and deletes history entries", async ({ page }) => {
    const house = bean();
    const decaf = bean({ id: "bean-decaf", brand: "Night", blend: "Quiet", decaf: true, roastOrigin: "Colombia" });
    await gotoApp(page, emptyData({
        beanPresets: [house, decaf],
        entries: [
            entry({ id: "entry-low", meta: { brewedAt: "2026-01-01T12:00:00.000Z", beanPresetId: house.id }, taste: { overallScore: 4 }, brew: { ratio: 1.8 } }),
            entry({ id: "entry-high", meta: { brewedAt: "2026-01-05T12:00:00.000Z", beanPresetId: decaf.id }, grind: { doseG: 19 }, taste: { overallScore: 9 }, brew: { drinkType: "americano", ratio: 2.5, waterMl: 100, compositionRatio: 2 } })
        ]
    }));
    const fields = appLocators(page);
    await page.getByTestId(testIds.navHistory).click();
    await expect(page.getByTestId(testIds.entryRow)).toHaveCount(2);
    await expect(page.getByTestId(testIds.historyViewCompact)).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByTestId(testIds.entryRow).first()).toContainText("Yield40g");
    await expect(page.getByTestId(testIds.entryRow).first()).toContainText("Time28s");
    await page.getByTestId(testIds.toggleFilters).click();
    await expect(page.getByTestId(testIds.filters)).toBeVisible();
    await fields.sortBy.selectOption("scoreAsc");
    await expect(page.getByTestId(testIds.filterStatus)).toHaveText("Worst");
    await expect(page.getByTestId(testIds.entryRow).first()).toContainText("Score4");
    await fields.sortBy.selectOption("scoreDesc");
    await expect(page.getByTestId(testIds.filterStatus)).toHaveText("Best");
    await expect(page.getByTestId(testIds.entryRow).first()).toContainText("Score9");
    await fields.filterBean.selectOption(decaf.id);
    await expect(page.getByTestId(testIds.filterStatus)).toHaveText("Filtered");
    await expect(page.getByTestId(testIds.entryRow)).toHaveCount(1);
    await expect(page.getByTestId(testIds.entryRow)).toContainText("Night / Quiet");
    await expect(page.getByTestId(testIds.entryRow)).toContainText("Americano");
    await fields.filterDrinkType.selectOption("espresso");
    await expect(page.getByTestId(testIds.entryList)).toContainText("No drinks match this view.");
    await fields.filterDrinkType.selectOption("");
    await fields.scoreMin.fill("10");
    await expect(page.getByTestId(testIds.entryList)).toContainText("No drinks match this view.");
    await fields.scoreMin.fill("");
    await fields.startDate.fill("2026-01-05");
    await fields.endDate.fill("2026-01-05");
    await expect(page.getByTestId(testIds.entryRow)).toHaveCount(1);
    await page.getByTestId(testIds.entryRow).click();
    await expect(page.getByTestId(testIds.entryDetail)).toContainText("Night");
    await expect(page.getByTestId(testIds.entryDetail)).toContainText("Water:Coffee");
    await page.getByTestId(testIds.editEntry).click();
    await expect(page.getByRole("heading", { name: "Edit Drink" })).toBeVisible();
    await fields.yieldValue.fill("45");
    await expect(page.getByTestId(testIds.ratioPreview)).toHaveText("1:2.37");
    await page.getByTestId(testIds.cancelEdit).click();
    await expect(page.getByTestId(testIds.entryDetail)).not.toContainText("45");
    await page.getByTestId(testIds.editEntry).click();
    await fields.yieldValue.fill("45");
    await page.getByTestId(testIds.saveShot).click();
    await expectToast(page, "Drink updated.");
    await expect(page.getByTestId(testIds.entryDetail)).toContainText("45");
    await deleteHistoryEntry(page);
});
test("switches history between compact and detailed views and remembers the choice", async ({ page }) => {
    const house = bean();
    await gotoApp(page, emptyData({
        beanPresets: [house],
        entries: [
            entry({ id: "entry-alpha", meta: { beanPresetId: house.id }, grind: { doseG: 18 }, brew: { shotTimeSeconds: 28, yieldValue: 40, yieldUnit: "g", ratio: 2.22 }, taste: { overallScore: 9 } })
        ]
    }));
    await page.getByTestId(testIds.navHistory).click();
    await expect(page.getByTestId(testIds.historyViewCompact)).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByTestId(testIds.entryRow)).toContainText("DF5414.5");
    await expect(page.getByTestId(testIds.entryRow)).toContainText("Yield40g");
    await expect(page.getByTestId(testIds.entryRow)).toContainText("Time28s");
    await page.getByTestId(testIds.historyViewDetailed).click();
    await expect(page.getByTestId(testIds.historyViewDetailed)).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByTestId(testIds.entryRow)).toContainText("Dose18g");
    await expect(page.getByTestId(testIds.entryRow)).toContainText("DF5414.5");
    await expect(page.getByTestId(testIds.entryRow)).not.toContainText("Yield40g");
    await page.reload();
    await page.getByTestId(testIds.navHistory).click();
    await expect(page.getByTestId(testIds.historyViewDetailed)).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByTestId(testIds.entryRow)).toContainText("Dose18g");
});
test("compact history rows fit on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoApp(page, emptyData({
        beanPresets: [bean({ brand: "Long Brand Name", blend: "Long Blend Name" })],
        entries: [
            entry({ meta: { beanPresetId: "bean-house" }, brew: { drinkType: "flat_white", shotTimeSeconds: 29, yieldValue: 42, yieldUnit: "g", ratio: 2.33 }, taste: { overallScore: 8 } })
        ]
    }));
    await page.getByTestId(testIds.navHistory).click();
    await expect(page.getByTestId(testIds.entryRow)).toContainText("Flat white");
    const overflows = await page.getByTestId(testIds.entryRow).evaluate((row) => row.scrollWidth > row.clientWidth);
    expect(overflows).toBe(false);
});
test("new entries created through the UI are listed in history", async ({ page }) => {
    await gotoApp(page);
    await createShotThroughUi(page, { score: "8" });
    await page.getByTestId(testIds.backHistory).click();
    await expect(page.getByTestId(testIds.entryRow)).toHaveCount(1);
    await page.getByTestId(testIds.entryRow).click();
    await expect(page.getByTestId(testIds.entryDetail)).toContainText("brown sugar");
});
async function deleteHistoryEntry(page) {
    page.once("dialog", async (dialog) => dialog.dismiss());
    await page.getByTestId(testIds.deleteEntry).click();
    await expect(page.getByTestId(testIds.entryDetail)).toBeVisible();
    page.once("dialog", async (dialog) => dialog.accept());
    await page.getByTestId(testIds.deleteEntry).click();
    await expectToast(page, "Drink deleted.");
    await expect(page.getByRole("heading", { name: "History" })).toBeVisible();
    await expect(page.getByTestId(testIds.entryRow)).toHaveCount(1);
    await expect(page.getByTestId(testIds.entryList)).not.toContainText("Night / Quiet");
}
