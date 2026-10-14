import { expect, test } from "@playwright/test";
import { appLocators, emptyData, expectToast, fillShotForm, gotoApp, testIds } from "./helpers.js";
test("creates a complete espresso drink, previews ratio, and persists it", async ({ page }) => {
    await gotoApp(page);
    const fields = appLocators(page);
    await expect(page.getByRole("heading", { name: "New Drink" })).toBeVisible();
    await expect(fields.beanSearch).toHaveValue("");
    await expect(fields.drinkType).toHaveValue("espresso");
    await fillShotForm(page);
    await expect(page.getByTestId(testIds.ratioPreview)).toHaveText("1:2.33");
    await page.getByRole("button", { name: "Skip" }).click();
    await page.getByTestId(testIds.saveShot).click();
    await expectToast(page, "Drink saved.");
    await expect(page.getByRole("heading", { name: "Drink Detail" })).toBeVisible();
    await expect(page.getByTestId(testIds.entryDetail)).toContainText("House");
    await expect(page.getByTestId(testIds.entryDetail)).toContainText("Espresso");
    await expect(page.getByTestId(testIds.entryDetail)).toContainText("42");
    await expect(page.getByTestId(testIds.entryDetail)).toContainText("1:2.33");
    await expect(page.getByTestId(testIds.entryDetail)).toContainText("Harder than usual");
    await expect(page.getByTestId(testIds.entryDetail)).toContainText("Clean/new");
    await expect(page.getByTestId(testIds.entryDetail)).toContainText("Overall score-");
    await page.reload();
    await page.getByTestId(testIds.navHistory).click();
    await expect(page.getByTestId(testIds.entryRow)).toHaveCount(1);
});
test("creates an americano with water to coffee ratio", async ({ page }) => {
    await gotoApp(page);
    const fields = appLocators(page);
    await fillShotForm(page, { drinkType: "americano", waterMl: "120" });
    await expect(fields.waterMl).toBeVisible();
    await expect(fields.milkMl).toBeHidden();
    await expect(fields.compositionRatioPreview).toHaveText("2.86:1");
    await page.getByTestId(testIds.saveShot).click();
    await expectToast(page, "Drink saved.");
    await expect(page.getByTestId(testIds.entryDetail)).toContainText("Americano");
    await expect(page.getByTestId(testIds.entryDetail)).toContainText("Water");
    await expect(page.getByTestId(testIds.entryDetail)).toContainText("120 ml");
    await expect(page.getByTestId(testIds.entryDetail)).toContainText("2.86:1");
});
test("creates a milk drink and clears hidden composition fields after type switch", async ({ page }) => {
    await gotoApp(page);
    const fields = appLocators(page);
    await fillShotForm(page, {
        drinkType: "cappuccino",
        milkMl: "130",
        milkBrand: "Lala",
        milkType: "whole"
    });
    await expect(fields.milkMl).toBeVisible();
    await expect(fields.waterMl).toBeHidden();
    await expect(fields.compositionRatioPreview).toHaveText("3.1:1");
    await fields.drinkType.selectOption("espresso");
    await expect(fields.milkMl).toBeHidden();
    await page.getByTestId(testIds.saveShot).click();
    await expectToast(page, "Drink saved.");
    await expect(page.getByTestId(testIds.entryDetail)).toContainText("Espresso");
    await expect(page.getByTestId(testIds.entryDetail)).not.toContainText("Lala");
    await expect(page.getByTestId(testIds.entryDetail)).not.toContainText("whole");
    await expect(page.getByTestId(testIds.entryDetail)).not.toContainText("3.1:1");
});
test("manage button routes to settings and invalid drink shows validation toast", async ({ page }) => {
    await gotoApp(page, emptyData());
    const fields = appLocators(page);
    await expect(fields.beanSearch).toHaveValue("");
    await page.getByTestId(testIds.manageBeans).click();
    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
    await page.getByTestId(testIds.navNew).click();
    await fields.beanSearch.fill("Missing / Bean");
    await fields.beanSearch.dispatchEvent("change");
    await page.getByTestId(testIds.saveShot).click();
    await expectToast(page, "Entry requires a safe bean preset id.");
});
test("clear button empties the selected bean", async ({ page }) => {
    await gotoApp(page);
    const fields = appLocators(page);
    await fields.beanSearch.fill("House / First Dial-In");
    await fields.beanSearch.dispatchEvent("change");
    await page.getByTestId(testIds.clearBean).click();
    await expect(fields.beanSearch).toHaveValue("");
    await page.getByTestId(testIds.saveShot).click();
    await expectToast(page, "Entry requires a safe bean preset id.");
});
test("score slider can be set after skipping", async ({ page }) => {
    await gotoApp(page);
    const fields = appLocators(page);
    await fillShotForm(page, { score: "6" });
    await page.getByRole("button", { name: "Skip" }).click();
    await fields.overallScore.fill("7");
    await fields.overallScore.dispatchEvent("input");
    await page.getByTestId(testIds.saveShot).click();
    await expectToast(page, "Drink saved.");
    await expect(page.getByTestId(testIds.entryDetail)).toContainText("Overall score");
    await expect(page.getByTestId(testIds.entryDetail)).toContainText("7");
});
test("taste info buttons explain the rating fields", async ({ page }) => {
    await gotoApp(page);
    await page.getByRole("button", { name: "About Acidity/brightness" }).click();
    await expect(page.getByRole("dialog", { name: "Acidity/brightness" })).toBeVisible();
    await expect(page.getByRole("dialog")).toContainText("too much can taste sour");
    await expect(page.getByRole("dialog")).toContainText("Does it lean unpleasantly sour or sharp?");
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();
    await page.getByRole("button", { name: "About Body/mouthfeel" }).click();
    await expect(page.getByRole("dialog", { name: "Body/mouthfeel" })).toBeVisible();
    await expect(page.getByRole("dialog")).toContainText("The weight and texture of the coffee in your mouth.");
});
