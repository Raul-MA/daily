import { readData } from "../core/storage.js";

export function getInsights() {
  const { entries, beanPresets } = readData();
  const scored = entries.filter((entry) => Number.isFinite(entry.taste.overallScore));
  const top = scored.filter((entry) => entry.taste.overallScore >= 8);
  const averageTopRatio = top.length
    ? top.reduce((sum, entry) => sum + (entry.brew.ratio || 0), 0) / top.filter((entry) => entry.brew.ratio).length
    : null;

  const best = [...scored].sort((a, b) => b.taste.overallScore - a.taste.overallScore)[0] || null;
  const beanMap = new Map(beanPresets.map((bean) => [bean.id, bean]));

  return {
    totalEntries: entries.length,
    scoredEntries: scored.length,
    topRatedEntries: top.length,
    averageTopRatio: averageTopRatio ? Number(averageTopRatio.toFixed(2)) : null,
    bestEntry: best,
    bestBean: best ? beanMap.get(best.meta.beanPresetId) || null : null
  };
}
