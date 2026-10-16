import { copy } from './copy.js';


export function playerDisplayName(data, session, playerId) {
  return (
    data.players.find((player) => player.id === playerId)?.name ||
    session.participants.find((participant) => participant.playerId === playerId)?.nameSnapshot ||
    copy("Unknown player")
  );
}
