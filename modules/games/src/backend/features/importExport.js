import { normalizeData } from "../core/schema.js";
import { replaceData, saveData } from "../core/storage.js";
import { validateBackup } from "../core/validation.js";

export function createExportPayload(data) {
  return JSON.stringify(
    {
      ...normalizeData(data),
      exportedAt: new Date().toISOString()
    },
    null,
    2
  );
}

export function downloadBackup(data, filename = `board-game-score-tracker-${new Date().toISOString().slice(0, 10)}.json`) {
  const payload = createExportPayload(data);
  const blob = new Blob([payload], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);

  return saveData({
    ...data,
    settings: {
      ...data.settings,
      lastExportedAt: new Date().toISOString()
    }
  });
}

export async function parseBackupFile(file) {
  return JSON.parse(await file.text());
}

export function replaceFromBackup(backup) {
  const errors = validateBackup(backup);
  if (errors.length) return { data: null, errors };
  return { data: replaceData(normalizeData(backup)), errors: [] };
}
