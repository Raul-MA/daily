export function createModuleStore(state, options) {
    function readDocument(document) {
        const payload = Object.hasOwn(document.modules, options.id) ? document.modules[options.id] : undefined;
        if (payload && payload.version !== options.version)
            throw new Error('Unsupported module version.');
        const value = payload ? payload.data : options.initial();
        if (!options.validate(value))
            throw new Error('Invalid module data.');
        return value;
    }
    function read() { return readDocument(state.read().value); }
    function save(value) {
        const data = JSON.parse(JSON.stringify(value));
        if (!options.validate(data))
            throw new Error('Invalid module data.');
        state.commit(current => {
            readDocument(current);
            return { ...current, modules: { ...current.modules, [options.id]: { version: options.version, data: data } } };
        });
        return data;
    }
    return { read, save };
}
