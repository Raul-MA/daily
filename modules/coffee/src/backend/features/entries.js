import { readData, writeData } from '../core/storage.js';
import { validateEntry } from '../core/validation.js';
import { normalizeEntry } from './normalize-entry.js';

export function getEntries() {
  return readData().entries.sort((a, b) => new Date(b.meta.brewedAt) - new Date(a.meta.brewedAt));
}

export function getEntry(id) {
  return readData().entries.find((entry) => entry.id === id) || null;
}

export function createEntry(input) {
  const data = readData();
  const entry = normalizeEntry(input);
  const errors = validateEntry(entry);
  if (errors.length) throw new Error(errors.join(" "));

  data.entries.push(entry);
  writeData(data);
  return entry;
}

export function updateEntry(id, patch) {
  const data = readData();
  const index = data.entries.findIndex((entry) => entry.id === id);
  if (index === -1) throw new Error("Entry not found.");

  const entry = normalizeEntry(patch, data.entries[index]);
  const errors = validateEntry(entry);
  if (errors.length) throw new Error(errors.join(" "));

  data.entries[index] = entry;
  writeData(data);
  return entry;
}

export function deleteEntry(id) {
  const data = readData();
  data.entries = data.entries.filter((entry) => entry.id !== id);
  writeData(data);
}

export function filterEntries({ beanPresetId = "", drinkType = "", scoreMin = "", scoreMax = "", startDate = "", endDate = "" } = {}) {
  return getEntries().filter(entry => matchesEntry(entry, { beanPresetId, drinkType, scoreMin, scoreMax, startDate, endDate }));
}

export function sortEntries(entries, sortBy = "dateDesc") {
  const sorted = [...entries];
  if (sortBy === "scoreDesc") return sorted.sort((a, b) => (b.taste.overallScore || 0) - (a.taste.overallScore || 0));
  if (sortBy === "scoreAsc") return sorted.sort((a, b) => (a.taste.overallScore || 0) - (b.taste.overallScore || 0));
  if (sortBy === "dateAsc") return sorted.sort((a, b) => new Date(a.meta.brewedAt) - new Date(b.meta.brewedAt));
  return sorted.sort((a, b) => new Date(b.meta.brewedAt) - new Date(a.meta.brewedAt));
}

function matchesEntry(entry, filters) {
  if (filters.beanPresetId && entry.meta.beanPresetId !== filters.beanPresetId) return false;
  if (filters.drinkType && (entry.brew.drinkType || 'espresso') !== filters.drinkType) return false;
  return matchesScore(entry.taste.overallScore, filters) && matchesDate(entry.meta.brewedAt.slice(0, 10), filters);
}
function matchesScore(score, filters) {
  if (filters.scoreMin !== '' && (score === null || score < Number(filters.scoreMin))) return false;
  return !(filters.scoreMax !== '' && (score === null || score > Number(filters.scoreMax)));
}
function matchesDate(date, filters) {
  if (filters.startDate && date < filters.startDate) return false;
  return !(filters.endDate && date > filters.endDate);
}
