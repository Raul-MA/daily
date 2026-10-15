export const widgetIds = ['plants', 'activities', 'review', 'reader', 'quick', 'piano'];
export const quickIds = ['coffee', 'games', 'countdown', 'budget'];
function object(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function json(value) {
    if (value === null || typeof value === 'string' || typeof value === 'boolean')
        return true;
    if (typeof value === 'number')
        return Number.isFinite(value);
    if (Array.isArray(value))
        return value.every(json);
    return object(value) && Object.values(value).every(json);
}
function knownList(value, allowed) {
    return Array.isArray(value) && new Set(value).size === value.length && value.every(item => typeof item === 'string' && allowed.includes(item));
}
export function isLanguage(value) {
    return value === 'en' || value === 'es';
}
function preferences(value) {
    return object(value) && isLanguage(value.language) && knownList(value.widgets, widgetIds) && knownList(value.quickActions, quickIds);
}
function modulePayload(value) {
    return object(value) && typeof value.version === 'number' && Number.isInteger(value.version) && value.version >= 1 && json(value.data);
}
export function validateDailyDocument(value) {
    return object(value) && value.version === 1 && preferences(value.preferences) && object(value.modules) && Object.values(value.modules).every(modulePayload);
}
export function initialDailyDocument(language) {
    return { version: 1, preferences: { language, widgets: [...widgetIds], quickActions: [...quickIds] }, modules: {} };
}
