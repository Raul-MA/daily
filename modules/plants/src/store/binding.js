let current;

export function getPlantBinding() { return current; }

export function bindPlants(binding) {
  current = binding;
  return () => { if (current === binding) current = undefined; };
}
