import { copy } from './copy.js';


export function formatOutcome(outcome) {
  if (outcome === "win") return copy("Win");
  if (outcome === "loss") return copy("Loss");
  if (outcome === "tie") return copy("Tie");
  return copy("Not set");
}
