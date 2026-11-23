export const WINGSPAN_MODE = 'wingspan_base';
export const WINGSPAN_MAX_PLAYERS = 5;
export const categories = [
  { id: 'birds', label: 'Bird points' },
  { id: 'bonusCards', label: 'Bonus cards' },
  { id: 'goals', label: 'End-of-round goals' },
  { id: 'eggs', label: 'Eggs' },
  { id: 'cachedFood', label: 'Cached food' },
  { id: 'tuckedCards', label: 'Tucked cards' }
];
export const isWingspan = value => value?.scoringMode === WINGSPAN_MODE;
