

export function formatOutcome(outcome) {
  if (outcome === "win") return "Win";
  if (outcome === "loss") return "Loss";
  if (outcome === "tie") return "Tie";
  return "Not set";
}
