

export function iconFor(route) {
  return {
    play: ">",
    session: "=",
    history: "H",
    games: "G",
    players: "P",
    stats: "%",
    settings: "*"
  }[route];
}
