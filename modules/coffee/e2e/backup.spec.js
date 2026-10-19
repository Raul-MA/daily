import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { appLocators, bean, emptyData, entry, expectToast, gotoApp, readCoffeeData, confirmCoffeeImport, STORAGE_KEY, testIds } from "./helpers.js";
test("legacy imports keep merge tools and trigger setup after replace", async ({ page }) => {
    const { importMode } = appLocators(page);
    const legacySettings = {
        theme: "system",
        burrTouchReference: "",
        defaultYieldUnit: "g"
    };
    const legacyBackup = {
        ...emptyData({ beanPresets: [bean()] }),
        settings: legacySettings
    };
    await gotoApp(page, emptyData({
        beanPresets: [bean()],
        settings: {
            theme: "system",
            burrTouchReference: "",
            defaultYieldUnit: "g",
            toolsConfigured: true,
            tools: { wdt: true, distributor: false, puckScreen: true }
        }
    }));
    await page.getByTestId(testIds.navSettings).click();
    await page.getByTestId(testIds.importData).setInputFiles({
        name: "legacy-merge.json",
        mimeType: "application/json",
        buffer: Buffer.from(JSON.stringify(legacyBackup))
    });
    await confirmCoffeeImport(page);
    await expectToast(page, "Import complete.");
    let settings = (await readCoffeeData(page)).settings;
    expect(settings.toolsConfigured).toBe(true);
    expect(settings.tools).toEqual({ wdt: true, distributor: false, puckScreen: true });
    await page.getByTestId(testIds.importData).setInputFiles({
        name: "partial-tools-merge.json",
        mimeType: "application/json",
        buffer: Buffer.from(JSON.stringify({
            ...legacyBackup,
            settings: { ...legacySettings, tools: { distributor: true } }
        }))
    });
    await confirmCoffeeImport(page);
    await expectToast(page, "Import complete.");
    settings = (await readCoffeeData(page)).settings;
    expect(settings.tools).toEqual({ wdt: true, distributor: true, puckScreen: true });
    await importMode.selectOption("replace");
    await page.getByTestId(testIds.importData).setInputFiles({
        name: "legacy-replace.json",
        mimeType: "application/json",
        buffer: Buffer.from(JSON.stringify(legacyBackup))
    });
    await confirmCoffeeImport(page);
    await expectToast(page, "Import complete.");
    await expect(page.getByTestId(testIds.toolsSetupForm)).toBeVisible();
    settings = (await readCoffeeData(page)).settings;
    expect(settings.toolsConfigured).toBe(false);
});
test("exports data and imports merge, replace, and invalid backups", async ({ page }) => {
    const house = bean();
    await gotoApp(page, emptyData({
        beanPresets: [house],
        entries: [entry({ id: "entry-original", meta: { beanPresetId: house.id } })]
    }));
    await page.getByTestId(testIds.navSettings).click();
    const downloadPromise = page.waitForEvent("download");
    await page.getByTestId(testIds.exportData).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^crois-\d{4}-\d{2}-\d{2}\.json$/);
    const exported = JSON.parse(await readFile(await download.path(), "utf8"));
    expect(exported.entries).toHaveLength(1);
    expect(exported.entries[0].brew.drinkType).toBe("espresso");
    expect(exported.entries[0].brew.compositionRatio).toBeNull();
    expect(exported.beanPresets).toHaveLength(1);
    expect(new Date(exported.settings.lastExportedAt).toString()).not.toBe("Invalid Date");
    await mergeBackup(page);
    await page.getByTestId(testIds.navSettings).click();
    await appLocators(page).importMode.selectOption("replace");
    const legacyEntry = entry({ id: "entry-replace", meta: { beanPresetId: "bean-replace" } });
    delete legacyEntry.brew.drinkType;
    delete legacyEntry.brew.waterMl;
    delete legacyEntry.brew.milkMl;
    delete legacyEntry.brew.milkBrand;
    delete legacyEntry.brew.milkType;
    delete legacyEntry.brew.compositionRatio;
    const replaceData = emptyData({
        beanPresets: [bean({ id: "bean-replace", brand: "Replace", blend: "Only" })],
        entries: [legacyEntry]
    });
    await page.getByTestId(testIds.importData).setInputFiles({
        name: "replace.json",
        mimeType: "application/json",
        buffer: Buffer.from(JSON.stringify(replaceData))
    });
    await confirmCoffeeImport(page);
    await expectToast(page, "Import complete.");
    await page.getByTestId(testIds.navHistory).click();
    await expect(page.getByTestId(testIds.entryRow)).toHaveCount(1);
    await expect(page.getByTestId(testIds.entryRow)).toContainText("Replace / Only");
    await expect(page.getByTestId(testIds.entryRow)).toContainText("Espresso");
    const replaced = (await readCoffeeData(page)).entries[0];
    expect(replaced.brew.drinkType).toBe("espresso");
    expect(replaced.brew.compositionRatio).toBeNull();
    await page.getByTestId(testIds.navSettings).click();
    await page.getByTestId(testIds.importData).setInputFiles({
        name: "invalid.json",
        mimeType: "application/json",
        buffer: Buffer.from("{bad json")
    });
    await expectToast(page, "Import failed because the selected file is not valid JSON.");
});
async function mergeBackup(page) {
    await page.evaluate(async (key) => {
        const root = JSON.parse(localStorage.getItem(key));
        const data = key === 'daily:v1' ? root.modules.coffee.data : root;
        data.beanPresets.push({
            id: "bean-imported",
            schemaVersion: 1,
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z",
            brand: "Imported",
            blend: "Merge",
            decaf: false,
            roastOrigin: "Brazil"
        });
        localStorage.setItem(key, JSON.stringify(root));
    }, STORAGE_KEY);
    await page.evaluate(async (data) => {
        window.__mergeBackup = data;
    }, emptyData({
        beanPresets: [bean({ id: "bean-merge", brand: "Merge", blend: "Bean" })],
        entries: [entry({ id: "entry-merge", meta: { beanPresetId: "bean-merge" } })]
    }));
    await page.getByTestId(testIds.importData).setInputFiles({
        name: "merge.json",
        mimeType: "application/json",
        buffer: Buffer.from(JSON.stringify(await page.evaluate(() => window.__mergeBackup)))
    });
    await confirmCoffeeImport(page);
    await expectToast(page, "Import complete.");
    await page.getByTestId(testIds.navHistory).click();
    await expect(page.getByTestId(testIds.entryRow)).toHaveCount(2);
}
