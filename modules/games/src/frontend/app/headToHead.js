import { buildHeadToHead } from '../../backend/features/stats.js';

export function headToHead(data, playerA, playerB) { return playerA && playerB ? buildHeadToHead(data, playerA, playerB) : null; }
