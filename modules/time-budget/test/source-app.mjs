import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

export async function sourceApp() {
  let app;
  if (process.env.DAILY_SOURCE_ROOT) {
    const source = await readFile(`${process.env.DAILY_SOURCE_ROOT}/timeBudget/app.js`, 'utf8');
    const context = { Date, Math, Number, window: { addEventListener: () => undefined }, setInterval: () => 1, clearInterval: () => undefined };
    app = runInNewContext(`${source}\napp;`, context);
  } else {
    const { createTimeApp } = await import('../src/app.js');
    app = createTimeApp();
  }
  for (const name of ['saveState', 'syncTimerControls', 'updateCurrentTask', 'updateRemainingTasks', 'scheduleTaskNotification', 'cancelScheduledNotification', 'showTimerScreen']) app[name] = () => undefined;
  return app;
}

export function session(app) {
  Object.assign(app.state, {
    goalTime: '23:59', startTime: Date.now(), currentTaskIndex: 0,
    timerRunning: false, timerStartTime: null, timerElapsed: 0,
    tasks: [
      { id: 1, name: 'Focus 🌱', allocatedMinutes: 5, actualMinutes: null, status: 'active' },
      { id: 2, name: 'Read', allocatedMinutes: 10, actualMinutes: null, status: 'pending' },
      { id: 3, name: 'Walk', allocatedMinutes: 15, actualMinutes: null, status: 'pending' },
    ],
  });
  return app;
}
