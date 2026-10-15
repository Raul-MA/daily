export const APP_ID = "board-game-score-tracker";
export const APP_SLUG = APP_ID;
export const SCHEMA_VERSION = "1.0";
export const STORAGE_KEY = `${APP_ID}:data`;

export const defaultSettings = {
  theme: "system",
  language: "en",
  lastExportedAt: null,
  backupReminderDays: 7,
  defaultRoundCount: 5,
  defaultTargetScore: 100,
  confirmBeforeFinishingSession: true,
  showArchived: false,
  historyPageSize: 25
};

export function createEmptyData() {
  const now = new Date().toISOString();
  return {
    appId: APP_ID,
    appSlug: APP_SLUG,
    schemaVersion: SCHEMA_VERSION,
    settings: { ...defaultSettings },
    players: [],
    games: [],
    sessions: [],
    metadata: {
      createdAt: now,
      updatedAt: now
    }
  };
}

export function parseVersion(version) {
  const [major, minor] = String(version || "").split(".").map((part) => Number.parseInt(part, 10));
  return {
    major: Number.isFinite(major) ? major : 0,
    minor: Number.isFinite(minor) ? minor : 0
  };
}

export function migrateData(raw) {
  const data = raw && typeof raw === "object" ? raw : createEmptyData();
  const incoming = parseVersion(data.schemaVersion);
  const current = parseVersion(SCHEMA_VERSION);

  if (incoming.major > current.major) {
    throw new Error("This backup was created by a newer incompatible version.");
  }

  return data;
}

export function normalizeData(raw) {
  const migrated = migrateData(raw);
  const empty = createEmptyData();
  const metadata = metadataObject(migrated.metadata);
  return {
    appId: APP_ID,
    appSlug: APP_SLUG,
    schemaVersion: SCHEMA_VERSION,
    settings: {
      ...defaultSettings,
      ...metadataObject(migrated.settings)
    },
    players: Array.isArray(migrated.players) ? migrated.players : [],
    games: Array.isArray(migrated.games) ? migrated.games : [],
    sessions: Array.isArray(migrated.sessions) ? migrated.sessions : [],
    metadata: {
      createdAt: metadata.createdAt || empty.metadata.createdAt,
      updatedAt: metadata.updatedAt || new Date().toISOString()
    }
  };
}

function metadataObject(value) { return value && typeof value === "object" ? value : {}; }
