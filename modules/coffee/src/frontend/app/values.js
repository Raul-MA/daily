export function entryValue(entry, group, key, fallback) { return entry?.[group]?.[key] ?? fallback; }
