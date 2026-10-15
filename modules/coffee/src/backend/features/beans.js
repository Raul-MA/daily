import { createId } from "../core/id.js";
import { SCHEMA_VERSION } from "../core/schema.js";
import { readData, writeData } from "../core/storage.js";
import { validateBeanPreset } from "../core/validation.js";

function now() {
  return new Date().toISOString();
}

export function getBeanPresets() {
  return readData().beanPresets.sort((a, b) => `${a.brand} ${a.blend}`.localeCompare(`${b.brand} ${b.blend}`));
}

export function getBeanPreset(id) {
  return readData().beanPresets.find((bean) => bean.id === id) || null;
}

export function createBeanPreset(input) {
  const data = readData();
  const timestamp = now();
  const bean = {
    id: createId(),
    schemaVersion: SCHEMA_VERSION,
    createdAt: timestamp,
    updatedAt: timestamp,
    brand: input.brand?.trim() || "",
    blend: input.blend?.trim() || "",
    decaf: Boolean(input.decaf),
    roastOrigin: input.roastOrigin?.trim() || ""
  };

  const errors = validateBeanPreset(bean);
  if (errors.length) throw new Error(errors.join(" "));

  data.beanPresets.push(bean);
  writeData(data);
  return bean;
}

export function updateBeanPreset(id, patch) {
  const data = readData();
  const index = data.beanPresets.findIndex((bean) => bean.id === id);
  if (index === -1) throw new Error("Bean preset not found.");

  const previous = data.beanPresets[index];
  const next = {
    ...previous,
    ...patch,
    brand: updatedText(patch, previous, 'brand'),
    blend: updatedText(patch, previous, 'blend'),
    roastOrigin: updatedText(patch, previous, 'roastOrigin'),
    decaf: typeof patch.decaf === "boolean" ? patch.decaf : data.beanPresets[index].decaf,
    updatedAt: now()
  };

  const errors = validateBeanPreset(next);
  if (errors.length) throw new Error(errors.join(" "));

  data.beanPresets[index] = next;
  writeData(data);
  return next;
}

export function canDeleteBeanPreset(id) {
  return !readData().entries.some((entry) => entry.meta.beanPresetId === id);
}

export function deleteBeanPreset(id) {
  if (!canDeleteBeanPreset(id)) {
    throw new Error("This bean is used by entries and cannot be deleted.");
  }

  const data = readData();
  data.beanPresets = data.beanPresets.filter((bean) => bean.id !== id);
  writeData(data);
}

function updatedText(patch, previous, key) { return patch[key]?.trim() ?? previous[key]; }
