import { addDays, addWeeks, addMonths, daysDiff } from '../utils/utils.js';


function toLocalDate(input) {
  if (!input) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input;
  return new Date(input).toLocaleDateString('en-CA');
}

function getManualNextDueDate(plant, type) {
  return toLocalDate(plant.schedule?.nextDueOverrides?.[type]) || null;
}

export function getLastCareDate(plant, type) {
  const entries = (plant.careLog ?? []).filter(e => e.type === type);
  if (!entries.length) return null;
  return entries.reduce((latest, e) => {
    const d = toLocalDate(e.date);
    return d > latest ? d : latest;
  }, toLocalDate(entries[0].date));
}



function matchSeason(seasons, month) {
  for (const s of seasons) {
    const inSeason = s.startMonth <= s.endMonth
      ? month >= s.startMonth && month <= s.endMonth
      : month >= s.startMonth || month <= s.endMonth;
    if (inSeason) return s;
  }
  return null;
}



export function getEffectiveWateringInterval(plant) {
  const schedule = plant.schedule ?? {};
  const season = matchSeason(schedule.wateringSeasons ?? [], new Date().getMonth() + 1);
  return season?.intervalDays ?? schedule.wateringIntervalDays ?? 7;
}

export function getEffectiveFertilizerInterval(plant) {
  const schedule = plant.schedule ?? {};
  const season = matchSeason(schedule.fertilizerSeasons ?? [], new Date().getMonth() + 1);
  return season ? season.intervalWeeks : schedule.fertilizerIntervalWeeks ?? 4;
}

function fertilizerPaused(plant, type, manualNextDue) {
  return type === 'fertilizer' && getEffectiveFertilizerInterval(plant) === null && !manualNextDue;
}

export function getNextDueDate(plant, type) {
  const manual = getManualNextDueDate(plant, type);
  if (manual) return manual;

  const last = getLastCareDate(plant, type);
  const base = last ?? toLocalDate(plant.dateAdded);
  switch (type) {
    case 'watering':   return addDays(base, getEffectiveWateringInterval(plant));
    case 'soil':       return addMonths(base, plant.schedule?.soilIntervalMonths ?? 12);
    case 'fertilizer': {
      const w = getEffectiveFertilizerInterval(plant);
      return w != null ? addWeeks(base, w) : null;
    }
    default: return null;
  }
}

export function getStatus(plant, type) {
  const manualNextDue = getManualNextDueDate(plant, type);


  if (fertilizerPaused(plant, type, manualNextDue)) {
    return { status: 'paused', days: null, nextDue: null, lastDate: getLastCareDate(plant, type) };
  }

  const last = getLastCareDate(plant, type);
  if (!last && !manualNextDue && !plant.dateAdded) {
    return { status: 'neutral', days: null, nextDue: null, lastDate: null };
  }

  const nextDue = getNextDueDate(plant, type);
  const diff    = daysDiff(nextDue);

  let status;
  if (diff < 0)       status = 'overdue';
  else if (diff <= 2) status = 'due-soon';
  else                status = 'ok';

  return { status, days: diff, nextDue, lastDate: last };
}


export function getUrgencyScore(plant) {
  let score = 0;
  for (const type of ['watering', 'soil', 'fertilizer']) {
    const { status, days } = getStatus(plant, type);
    if (status === 'overdue')       score += 1000 + Math.abs(days ?? 0) * 10;
    else if (status === 'due-soon') score += 100  + (2 - (days ?? 2))   * 10;
    else if (status === 'neutral')  score += 50;

  }
  return score;
}
