export function allocateSessionSeconds(minutes) {
  const duration = Number(minutes)
  if (!Number.isInteger(duration) || duration < 3 || duration > 120) throw new RangeError('Choose 3–120 whole minutes')
  const total = duration * 60
  const explain = Math.round(total * .1)
  const recall = Math.round(total * .3)
  const recap = Math.round(total * .1)
  return [explain, recall, total - explain - recall - recap, recap]
}
