import { pianoContext } from './js/context.js';

export function exerciseState(initial) {
  const state = structuredClone(pianoContext.ui.exercise?.state ?? initial);
  if (state.playing) {
    state.playing = false;
    state.status = 'Press "Play" to start';
  }
  return state;
}

export function resumeExercise(context) {
  if (context.state.question) context.update();
  else context.next([]);
}

function snapshot(context) {
  const select = context.container.querySelector('.filter-control .multi-select');
  const seconds = context.container.querySelector('.auto-advance-seconds');
  return {
    state: structuredClone(context.state),
    filters: Array.from(select?.selectedOptions ?? [], option => option.value),
    filterOpen: Boolean(context.container.querySelector('.filter-popover.open')),
    seconds: seconds?.value ?? null,
    automatic: Boolean(context.container.querySelector('.auto-advance-toggle.btn-primary')),
  };
}

export function exerciseCleanup(context, cleanup) {
  const ui = pianoContext.ui;
  return () => {
    ui.exercise = snapshot(context);
    cleanup();
  };
}

export function restoreExerciseShell(context) {
  const saved = pianoContext.ui.exercise;
  if (!saved) return;
  if (context.selectEl) {
    for (const option of context.selectEl.options) option.selected = saved.filters.includes(option.value);
    context.selectedFilter = context.filterOptions.filter(option => saved.filters.includes(String(option.value))).map(option => option.value);
    context.rebuildChips();
    context.filterPopover.classList.toggle('open', saved.filterOpen);
    context.filterBtn.setAttribute('aria-expanded', String(saved.filterOpen));
  }
  const seconds = context.container.querySelector('.auto-advance-seconds');
  if (seconds && saved.seconds !== null) seconds.value = saved.seconds;
  if (saved.automatic) context.timer.start();
}

export function restoreProgression(context) {
  const saved = pianoContext.ui.progression;
  if (saved) Object.assign(context, structuredClone(saved));
}

export function progressionCleanup(context) {
  const ui = pianoContext.ui;
  return () => {
    const { root, scaleName, length, progression } = context;
    ui.progression = structuredClone({ root, scaleName, length, progression });
  };
}
