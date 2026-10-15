import { positiveInteger } from './common.js';

export function validatePlayer(player, players = []) {
 const name = playerName(player);
 const errors = [];
 if (!player || typeof player !== 'object') errors.push('Player is required.');
 if (!name) errors.push('Player name is required.');
 if (name.length > 60) errors.push('Player name must be 60 characters or fewer.');
 if (duplicateName(player, players, name)) errors.push('Player name must be unique.');
 return errors;
}

export function validateGame(game) {
 const value = game ?? {};
 const errors = [];
 if (!game || typeof game !== 'object') errors.push('Game is required.');
 const name = String(value.name || '').trim();
 if (!name) errors.push('Game name is required.');
 if (name.length > 80) errors.push('Game name must be 80 characters or fewer.');
 if (!['win_loss_tie', 'highest_score_after_rounds', 'first_to_points'].includes(value.scoringMode)) errors.push('Choose a valid scoring mode.');
 return [...errors, ...gameScoringErrors(value), ...gamePlayerErrors(value)];
}

export function duplicateName(player, players, name) {
 return players.some(item => item?.id !== player?.id && String(item?.name || '').trim().toLowerCase() === name.toLowerCase());
}

function playerName(player) { return String(player?.name || '').trim(); }

export function gameScoringErrors(game) {
 const errors = [];
 if (!game.isCollaborative && game.scoringMode === 'highest_score_after_rounds' && !positiveInteger(game.roundCount)) errors.push('Round count must be a positive whole number.');
 if (!game.isCollaborative && game.scoringMode === 'first_to_points' && !positiveInteger(game.targetScore)) errors.push('Target score must be a positive whole number.');
 return errors;
}

export function gamePlayerErrors(game) {
 const errors = [];
 if (game.isCollaborative !== undefined && typeof game.isCollaborative !== 'boolean') errors.push('Collaborative game must be true or false.');
 errors.push(...playerBoundErrors(game.minPlayers, 'Minimum'), ...playerBoundErrors(game.maxPlayers, 'Maximum'));
 if (positiveInteger(game.minPlayers) && positiveInteger(game.maxPlayers) && Number(game.maxPlayers) < Number(game.minPlayers)) errors.push('Maximum players must be greater than or equal to minimum players.');
 return errors;
}

export function playerBoundErrors(value, label) { return value != null && !positiveInteger(value) ? [label + ' players must be a positive whole number.'] : []; }
