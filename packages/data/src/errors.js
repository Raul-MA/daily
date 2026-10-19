export class DataConflictError extends Error {
  constructor() { super('Data changed in another view.'); }
}
