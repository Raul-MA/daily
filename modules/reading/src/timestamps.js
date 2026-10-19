export function validTimestamp(value) {
  return Number.isFinite(value) && value >= 0 && value <= 8640000000000000;
}
