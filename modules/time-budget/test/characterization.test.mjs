import test from 'node:test';
import assert from 'node:assert/strict';
import { sourceApp, session } from './source-app.mjs';

test('time input is strict local HH:MM and invalid deadlines are rejected', async () => {
  const app = await sourceApp();
  for (const value of ['00:00', '23:59', '09:05']) assert.equal(app.isValidTimeString(value), true);
  for (const value of ['24:00', '12:60', '9:05', '', null, 1200]) {
    assert.equal(app.isValidTimeString(value), false);
    assert.equal(app.getGoalDate(value), null);
  }
});

test('a deadline at or before the reference rolls to the next local day', async () => {
  const app = await sourceApp();
  const reference = new Date(2026, 9, 15, 23, 30, 0);
  const goal = app.getGoalDate('00:15', reference);
  assert.equal(goal.getDate(), 16);
  assert.equal(goal.getHours(), 0);
  assert.equal(goal.getMinutes(), 15);
  assert.equal(app.getGoalDate('23:30', reference).getDate(), 16);
  assert.equal(app.getGoalDate('23:31', reference).getDate(), 15);
});

test('session deadlines stay anchored to the original start after midnight and overdue', async t => {
  t.mock.method(Date, 'now', () => new Date(2026, 9, 16, 12).getTime());
  const app = session(await sourceApp());
  app.state.startTime = new Date(2026, 9, 14, 23, 30).getTime();
  app.state.goalTime = '00:15';
  const goal = app.getSessionGoalDate();
  assert.equal(goal.getDate(), 15);
  assert.equal(goal.getHours(), 0);
  assert.equal(goal.getMinutes(), 15);
  assert.ok(app.getRemainingBudgetMinutes() < 0);
});

test('pending budgets include unfinished current minutes and every later task once', async () => {
  const app = session(await sourceApp());
  assert.equal(app.getPendingMinutes(), 30);
  app.state.timerElapsed = 120000;
  assert.equal(app.getPendingMinutes(), 28);
  app.state.timerElapsed = 600000;
  assert.equal(app.getPendingMinutes(), 25);
  app.getRemainingBudgetMinutes = () => 24.5;
  assert.equal(app.getFreeRemainingMinutes(), -1);
});

test('paused task timers resume from elapsed time and pause without losing elapsed time', async () => {
  const app = session(await sourceApp());
  app.state.timerElapsed = 90000;
  const before = Date.now();
  app.startTimer();
  assert.equal(app.state.timerRunning, true);
  assert.ok(app.state.timerStartTime >= before - 90000);
  assert.ok(app.state.timerStartTime <= Date.now() - 90000);
  app.pauseTimer();
  assert.equal(app.state.timerRunning, false);
  assert.ok(app.state.timerElapsed >= 90000);
});

test('completing an overrun records exact actual minutes and offers reallocation', async () => {
  const app = session(await sourceApp());
  app.state.timerElapsed = 390000;
  let deficit;
  app.showReallocationModal = value => { deficit = value; };
  app.moveToNextTask = () => assert.fail('Overrun must offer reallocation first.');
  app.completeTask();
  assert.equal(app.state.tasks[0].actualMinutes, 6.5);
  assert.equal(app.state.tasks[0].status, 'completed');
  assert.equal(deficit, 1.5);
  assert.equal(app.state.currentTaskIndex, 0);
});

test('early completion advances explicitly and queue reorder never moves the current task', async () => {
  const app = session(await sourceApp());
  app.moveRemainingTaskUp(1);
  assert.deepEqual(Array.from(app.state.tasks, task => task.id), [1, 2, 3]);
  app.moveRemainingTaskDown(1);
  assert.deepEqual(Array.from(app.state.tasks, task => task.id), [1, 3, 2]);
  app.moveRemainingTaskUp(2);
  assert.deepEqual(Array.from(app.state.tasks, task => task.id), [1, 2, 3]);
  let moved = false;
  app.moveToNextTask = () => { moved = true; };
  app.state.timerElapsed = 60000;
  app.completeTask();
  assert.equal(app.state.tasks[0].actualMinutes, 1);
  assert.equal(moved, true);
});

test('template collections retain Unicode and bounded whole-minute tasks', async () => {
  const app = await sourceApp();
  assert.equal(app.isValidTemplateCollection({ 'Mañana 🌱': [{ name: 'Café ☕', minutes: 10 }] }), true);
  assert.equal(app.isValidTemplateCollection({}), true);
  for (const value of [[], null, { '': [{ name: 'Task', minutes: 1 }] }, { Plan: [] }, { Plan: [{ name: '', minutes: 1 }] }, { Plan: [{ name: 'Task', minutes: 0 }] }, { Plan: [{ name: 'Task', minutes: 1441 }] }, { Plan: [{ name: 'Task', minutes: 1.5 }] }]) assert.equal(Boolean(app.isValidTemplateCollection(value)), false);
  assert.equal(app.formatMinutes(90), '1h 30m');
  assert.equal(app.formatMinutes(-5), '5 min');
});
