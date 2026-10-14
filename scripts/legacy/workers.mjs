const guards = {
  stillgreen: ["k => k !== CACHE_NAME", "k => k.startsWith('plant-tracker-') && k !== CACHE_NAME"],
  'coffee-tracker': ['(key) => key !== CACHE_NAME', '(key) => key.startsWith("crois-") && key !== CACHE_NAME'],
  'game-tracker': ['(key) => key !== CACHE_NAME', '(key) => key.startsWith("board-game-score-tracker-") && key !== CACHE_NAME'],
  timeBudget: ['cacheName !== CACHE_NAME', "cacheName.startsWith('time-budget-') && cacheName !== CACHE_NAME"],
  toniq: ['(k) => k !== CACHE_NAME', "(k) => k.startsWith('toniq-') && k !== CACHE_NAME"],
};

export function patchWorker(repo, source) {
  const guard = guards[repo];
  if (!guard) throw new Error(`Unknown legacy worker: ${repo}`);
  if (source.split(guard[0]).length !== 2) throw new Error(`Legacy worker changed: ${repo}; review before preparing its patch.`);
  return source.replace(guard[0], guard[1]);
}
