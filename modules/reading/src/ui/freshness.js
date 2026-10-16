const en = { saved: 'Saved selection', fetched: 'Last fetched', unknown: 'Fetch time unavailable', stale: 'Stale metadata', truncated: 'Scan truncated; more matching items may exist.' };
const es = { saved: 'Selección guardada', fetched: 'Última consulta', unknown: 'Fecha de consulta desconocida', stale: 'Metadatos desactualizados', truncated: 'Consulta limitada; puede haber más coincidencias.' };

export function readingMetadataText(data, language) {
  const labels = language === 'es' ? es : en;
  const parts = [labels.saved];
  if (Number.isFinite(data.picks.fetchedAt)) addTime(parts, data, language, labels);
  else parts.push(labels.unknown);
  if (data.picks.scan?.truncated) parts.push(labels.truncated);
  return parts.join(' · ');
}
function addTime(parts, data, language, labels) {
  parts.push(`${labels.fetched}: ${new Date(data.picks.fetchedAt).toLocaleString(language)}`);
  const age = Date.now() - data.picks.fetchedAt;
  if (age < 0 || age > data.settings.cacheMinutes * 60000) parts.push(labels.stale);
}
