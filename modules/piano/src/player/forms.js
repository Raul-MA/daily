export function inputValue(container, name) { return container.querySelector(`[name="${CSS.escape(name)}"]`); }
export function numberValue(container, name) { return Number(inputValue(container, name).value); }
export function readSettings(ctx) {
  const element = name => inputValue(ctx.container, name);
  const number = name => numberValue(ctx.container, name);
  const tpq = ctx.exercise.ticksPerQuarter ?? 960;
  return {
    variantId: element('variantId').value, speed: number('speed') / 100, accent: number('accent') / 100,
    tracks: Object.fromEntries(ctx.exercise.tracks.map(track => [track.id, { mute: element(`mute:${track.id}`).checked, volume: number(`volume:${track.id}`) / 100 }])),
    loop: { enabled: element('loopEnabled').checked, startTick: Math.round(number('loopStart') * tpq), endTick: Math.round(number('loopEnd') * tpq) },
    metronome: element('metronome').value, countIn: element('countIn').value, countBars: number('countBars'), gap: number('gap'),
    acceleration: { enabled: element('accelerate').checked, start: number('accStart') / 100, increment: number('accIncrement'), every: number('accEvery'), target: number('accTarget') / 100 },
  };
}
export function correctedExercise(ctx) {
  const exercise = structuredClone(ctx.exercise);
  const variant = exercise.variants.find(item => item.id === ctx.variant.id);
  const note = variant.notes.find(item => item.id === inputValue(ctx.container, 'noteId').value);
  const number = name => numberValue(ctx.container, name);
  Object.assign(note, { pitch: number('notePitch'), startTick: number('noteStart'), durationTicks: number('noteDuration'), trackId: inputValue(ctx.container, 'noteTrack').value, velocity: number('noteVelocity'), accent: inputValue(ctx.container, 'noteAccent').checked });
  return exercise;
}
export function setLoopInputs(ctx, loop) {
  const tpq = ctx.exercise.ticksPerQuarter ?? 960;
  inputValue(ctx.container, 'loopStart').value = loop.startTick / tpq;
  inputValue(ctx.container, 'loopEnd').value = loop.endTick / tpq;
  inputValue(ctx.container, 'loopEnabled').checked = true;
}
