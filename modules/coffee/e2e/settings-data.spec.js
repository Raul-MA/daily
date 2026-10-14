import { appURL } from '../../../tests/support/app-url.mjs';
import { expect, test } from "@playwright/test";
import { appLocators, bean, emptyData, entry, expectToast, fieldIds, fillShotForm, gotoApp, setToggle, STORAGE_KEY, testIds } from "./helpers.js";
test("creates, edits, deletes beans, and blocks deleting a used bean", async ({ page }) => {
    const usedBean = bean();
    await gotoApp(page, emptyData({
        beanPresets: [usedBean],
        entries: [entry({ meta: { beanPresetId: usedBean.id } })]
    }));
    await page.getByTestId(testIds.navSettings).click();
    const fields = appLocators(page);
    await fields.beanBrand.fill("Guest");
    await fields.beanBlend.fill("Washed");
    await fields.beanOrigin.fill("Kenya");
    await setToggle(page, fieldIds.beanDecaf, true);
    await page.getByTestId(testIds.saveBean).click();
    await expectToast(page, "Bean saved.");
    await expect(page.getByTestId(testIds.beanList)).toContainText("Guest / Washed");
    await expect(page.getByTestId(testIds.beanList)).toContainText("Decaf");
    const guestRow = page.getByTestId(testIds.beanRow).filter({ hasText: "Guest / Washed" });
    await guestRow.getByTestId(testIds.editBean).click();
    await fields.beanBlend.fill("Natural");
    await setToggle(page, fieldIds.beanDecaf, false);
    await page.getByTestId(testIds.saveBean).click();
    await expect(page.getByTestId(testIds.beanList)).toContainText("Guest / Natural");
    await page.getByTestId(testIds.beanRow).filter({ hasText: "House / First Dial-In" }).getByTestId(testIds.deleteBean).click();
    await expectToast(page, "This bean is used by entries and cannot be deleted.");
    await page.getByTestId(testIds.beanRow).filter({ hasText: "Guest / Natural" }).getByTestId(testIds.deleteBean).click();
    await expectToast(page, "Bean deleted.");
    await expect(page.getByTestId(testIds.beanList)).not.toContainText("Guest / Natural");
});
test("saves settings and persists theme", async ({ page }) => {
    await gotoApp(page);
    await page.getByTestId(testIds.navSettings).click();
    const { burrTouchReference, distributorTool, distributorUsed, puckScreenUsed, tampDeviation, theme, html, wdtUsed } = appLocators(page);
    await theme.selectOption("dark");
    await burrTouchReference.fill("+2.0 marks from chirp");
    await setToggle(page, fieldIds.toolDistributor, false);
    await page.getByTestId(testIds.saveSettings).click();
    await expectToast(page, "Settings saved.");
    await expect(html).toHaveAttribute("data-theme", "dark");
    await page.reload();
    await expect(html).toHaveAttribute("data-theme", "dark");
    await page.getByTestId(testIds.navSettings).click();
    await expect(burrTouchReference).toHaveValue("+2.0 marks from chirp");
    await expect(distributorTool).not.toBeChecked();
    await page.getByTestId(testIds.navNew).click();
    await expect(wdtUsed).toBeVisible();
    await expect(distributorUsed).toHaveCount(0);
    await expect(tampDeviation).toBeVisible();
    await expect(puckScreenUsed).toBeVisible();
});
test("switches to Spanish and persists translated UI", async ({ page }) => {
    await gotoApp(page);
    await page.getByTestId(testIds.navSettings).click();
    const { html, language } = appLocators(page);
    await language.selectOption("es");
    await page.getByTestId(testIds.saveSettings).click();
    await expectToast(page, "Ajustes guardados.");
    await expect(html).toHaveAttribute("lang", "es");
    await expect(page.getByTestId(testIds.navNew)).toContainText("Nuevo");
    await expect(page.getByRole("heading", { name: "Ajustes" })).toBeVisible();
    await page.getByTestId(testIds.navNew).click();
    await expect(page.getByRole("heading", { name: "Nueva bebida" })).toBeVisible();
    await expect(page.locator("#beanSearch-label")).toHaveText("Café");
    await page.getByTestId(testIds.saveShot).click();
    await expectToast(page, "La entrada requiere un id seguro de café guardado.");
    await page.reload();
    await expect(html).toHaveAttribute("lang", "es");
    await expect(page.getByTestId(testIds.navSettings)).toContainText("Ajustes");
});
test("reminds when data has not been exported recently and records exports", async ({ page }) => {
    await gotoApp(page, emptyData({
        settings: {
            ...emptyData().settings,
            lastExportedAt: "2026-01-01T00:00:00.000Z"
        }
    }));
    await page.getByTestId(testIds.navSettings).click();
    await expect(page.getByTestId(testIds.exportReminder)).toContainText("Last export was");
    const downloadPromise = page.waitForEvent("download");
    await page.getByTestId(testIds.exportData).click();
    await downloadPromise;
    await expect(page.getByTestId(testIds.exportReminder)).toHaveCount(0);
    const settings = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)).settings, STORAGE_KEY);
    expect(new Date(settings.lastExportedAt).toString()).not.toBe("Invalid Date");
});
test("shows the backup reminder on New and routes it to settings export", async ({ page }) => {
    await gotoApp(page, emptyData({
        settings: {
            ...emptyData().settings,
            lastExportedAt: null
        }
    }));
    await expect(page.getByTestId(testIds.newExportReminder)).toContainText("No backup export has been recorded");
    await expect(page.locator("#app > :first-child")).toHaveAttribute("data-testid", testIds.newExportReminder);
    await page.getByTestId(testIds.newExportReminder).click();
    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
    await expect(page.getByTestId(testIds.exportData)).toBeFocused();
});
test("asks for tools once and hides unavailable prep controls", async ({ page }) => {
    const { distributorUsed, puckScreenUsed, tampDeviation, wdtTool, wdtUsed } = appLocators(page);
    await page.goto(appURL("coffee"));
    await expect(page.getByTestId(testIds.toolsSetupForm)).toBeVisible();
    await expect(wdtTool).not.toBeChecked();
    await setToggle(page, fieldIds.toolWdt, true);
    await setToggle(page, fieldIds.toolPuckScreen, true);
    await page.getByTestId(testIds.saveToolsSetup).click();
    await expectToast(page, "Tools saved.");
    await expect(page.getByTestId(testIds.entryForm)).toBeVisible();
    await expect(wdtUsed).toBeVisible();
    await expect(distributorUsed).toHaveCount(0);
    await expect(tampDeviation).toBeVisible();
    await expect(puckScreenUsed).toBeVisible();
    const settings = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)).settings, STORAGE_KEY);
    expect(settings.toolsConfigured).toBe(true);
    expect(settings.tools).toEqual({ wdt: true, distributor: false, puckScreen: true });
});
test("skip tools setup saves no optional tools and entries keep explicit prep values", async ({ page }) => {
    const { distributorUsed, puckScreenUsed, tampDeviation, wdtUsed } = appLocators(page);
    await page.goto(appURL("coffee"));
    await page.getByTestId(testIds.skipToolsSetup).click();
    await expectToast(page, "Tools saved.");
    await expect(wdtUsed).toHaveCount(0);
    await expect(distributorUsed).toHaveCount(0);
    await expect(puckScreenUsed).toHaveCount(0);
    await expect(tampDeviation).toBeVisible();
    await fillShotForm(page);
    await page.getByTestId(testIds.saveShot).click();
    await expectToast(page, "Drink saved.");
    const entries = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)).entries, STORAGE_KEY);
    expect(entries[0].prep).toMatchObject({
        wdtUsed: false,
        distributorUsed: false,
        distributorPasses: null,
        puckScreenUsed: false,
        puckScreenCondition: null
    });
});
