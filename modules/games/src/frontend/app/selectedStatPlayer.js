

export function selectedStatPlayer(data, choice, excluded = '') { return choice || data.players.find(player => player.id !== excluded)?.id || ''; }
