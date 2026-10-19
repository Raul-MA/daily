import { exerciseTypes } from './types.js';

function matchesType(value, type) {
  if (type === 'array') return Array.isArray(value);
  if (type === 'object') return value !== null && typeof value === 'object' && !Array.isArray(value);
  if (type === 'integer') return Number.isSafeInteger(value);
  if (type === 'number') return Number.isFinite(value);
  return typeof value === type;
}
function bounds(value, schema, path, errors) {
  if (schema.minimum !== undefined && value < schema.minimum) errors.push(`${path}: minimum ${schema.minimum}`);
  if (schema.maximum !== undefined && value > schema.maximum) errors.push(`${path}: maximum ${schema.maximum}`);
  if (schema.exclusiveMinimum !== undefined && value <= schema.exclusiveMinimum) errors.push(`${path}: must be greater than ${schema.exclusiveMinimum}`);
  lengthBounds(value, schema, path, errors);
}
function lengthBounds(value, schema, path, errors) {
  if (schema.minLength && value.length < schema.minLength) errors.push(`${path}: cannot be empty`);
  if (schema.maxLength && value.length > schema.maxLength) errors.push(`${path}: too long`);
  if (schema.minItems && value.length < schema.minItems) errors.push(`${path}: requires at least ${schema.minItems} entries`);
}
function literals(value, schema, path, errors) {
  if (schema.const !== undefined && value !== schema.const) errors.push(`${path}: supported value is ${schema.const}`);
  if (schema.enum && !schema.enum.includes(value)) errors.push(`${path}: choose ${schema.enum.join(', ')}`);
}
function objectField(schema, key) { return Object.hasOwn(schema.properties ?? {}, key) ? schema.properties[key] : null; }
function objectFields(value, schema, path, errors) {
  for (const key of schema.required ?? []) {
    if (!Object.hasOwn(value, key)) errors.push(`${path}.${key}: required`);
  }
  for (const [key, item] of Object.entries(value)) {
    const field = objectField(schema, key);
    if (field) visit(item, field, `${path}.${key}`, errors);
    else if (schema.additionalProperties === false) errors.push(`${path}.${key}: unknown field`);
  }
}
function visit(value, input, path, errors) {
  const schema = input.$ref ? exerciseTypes[input.$ref.split('/').at(-1)] : input;
  if (schema.type && !matchesType(value, schema.type)) { errors.push(`${path}: expected ${schema.type}`); return; }
  literals(value, schema, path, errors);
  bounds(value, schema, path, errors);
  if (schema.type === 'object') objectFields(value, schema, path, errors);
  if (schema.type === 'array') value.forEach((item, index) => visit(item, schema.items, `${path}[${index}]`, errors));
}
export function shapeErrors(value) {
  const errors = [];
  visit(value, exerciseTypes.Exercise, '$', errors);
  return errors;
}
