import { BEBOP_SCALE_NAMES } from '../music/scales.js'

export const BEBOP_SEARCH_TERMS = BEBOP_SCALE_NAMES
  .flatMap(name => [name.toLowerCase(), name.toLowerCase().replace('bebop ', '')])
  .join(' ')

