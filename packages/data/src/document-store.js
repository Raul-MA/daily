class UnsupportedVersionError extends Error {
    constructor() { super('Unsupported future document version.'); }
}
function futureVersion(value) {
    return typeof value === 'object' && value !== null && 'version' in value && typeof value.version === 'number' && value.version > 1;
}
function decode(raw, validate) {
    let value;
    try {
        value = JSON.parse(raw);
    }
    catch {
        throw new Error('Invalid stored document; recovery is required.');
    }
    if (futureVersion(value))
        throw new UnsupportedVersionError();
    if (!validate(value))
        throw new Error('Invalid or unsupported document.');
    return value;
}
export function createDocumentStore(options) {
    const { storage, key, validate, initial } = options;
    function load() {
        const raw = storage.getItem(key);
        if (raw !== null) {
            try {
                return { value: decode(raw, validate), status: 'saved' };
            }
            catch (error) {
                if (error instanceof UnsupportedVersionError)
                    throw error;
                storage.setItem(`${key}:corrupt`, raw);
            }
        }
        const recovery = storage.getItem(`${key}:recovery`);
        if (recovery !== null)
            return { value: decode(recovery, validate), status: 'recovered' };
        if (raw !== null)
            throw new Error('Invalid stored document with no recovery.');
        return { value: decode(JSON.stringify(initial()), validate), status: 'initial' };
    }
    function save(value) {
        const raw = JSON.stringify(value);
        const next = decode(raw, validate);
        const previous = load();
        if (previous.status !== 'initial')
            storage.setItem(`${key}:recovery`, JSON.stringify(previous.value));
        storage.setItem(key, raw);
        return next;
    }
    return { load, save };
}
