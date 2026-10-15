import test from 'node:test';
import assert from 'node:assert/strict';
import { loadModule } from '../../../tests/support/load-module.mjs';

const care = await loadModule('plants', 'care/care.js');
const utils = await loadModule('plants', 'utils/utils.js');
const reminders = await loadModule('plants', 'care/reminders.js');
const plant = overrides => ({ id: 'fern-1', name: 'Helecho 🌱', dateAdded: '2026-07-01', schedule: { wateringIntervalDays: 7, soilIntervalMonths: 12, fertilizerIntervalWeeks: 4 }, careLog: [], ...overrides });
const fixed = (t, date) => t.mock.timers.enable({ apis: ['Date'], now: new Date(`${date}T12:00:00`) });

test('care dates use latest matching care and ignore notes skip and reschedule entries', () => {
  const item = plant({ careLog: [
    { type: 'watering', date: '2026-07-10' }, { type: 'watering', date: '2026-07-05' },
    { type: 'note', date: '2026-07-20' }, { type: 'skip', careType: 'watering', date: '2026-07-21' },
  ] });
  assert.equal(care.getLastCareDate(item, 'watering'), '2026-07-10');
  assert.equal(care.getNextDueDate(item, 'watering'), '2026-07-17');
});

test('watering seasons preserve wrap-around dry periods and growth intervals', t => {
  const item = plant({ schedule: { wateringSeasons: [{ startMonth: 10, endMonth: 2, intervalDays: 14 }, { startMonth: 3, endMonth: 9, intervalDays: 7 }] } });
  fixed(t, '2026-10-15');
  assert.equal(care.getEffectiveWateringInterval(item), 14);
  t.mock.timers.setTime(new Date('2027-02-10T12:00:00').getTime());
  assert.equal(care.getEffectiveWateringInterval(item), 14);
  t.mock.timers.setTime(new Date('2027-03-10T12:00:00').getTime());
  assert.equal(care.getEffectiveWateringInterval(item), 7);
});

test('fertilizer pause is preserved while a manual due date still takes precedence', t => {
  fixed(t, '2026-10-15');
  const schedule = { fertilizerSeasons: [{ startMonth: 9, endMonth: 2, intervalWeeks: null }] };
  assert.equal(care.getStatus(plant({ schedule }), 'fertilizer').status, 'paused');
  assert.equal(care.getNextDueDate(plant({ schedule }), 'fertilizer'), null);
  const manual = plant({ schedule: { ...schedule, nextDueOverrides: { fertilizer: '2026-10-15' } } });
  assert.equal(care.getStatus(manual, 'fertilizer').days, 0);
  assert.equal(care.getStatus(manual, 'fertilizer').status, 'due-soon');
});

test('care status distinguishes overdue today soon and future without mutating plants', t => {
  fixed(t, '2026-07-25');
  const expected = [['2026-07-24', 'overdue', -1], ['2026-07-25', 'due-soon', 0], ['2026-07-27', 'due-soon', 2], ['2026-07-28', 'ok', 3]];
  for (const [date, status, days] of expected) {
    const item = plant({ schedule: { nextDueOverrides: { watering: date } } });
    const before = JSON.stringify(item);
    assert.deepEqual(care.getStatus(item, 'watering'), { status, days, nextDue: date, lastDate: null });
    assert.equal(JSON.stringify(item), before);
  }
});

test('date arithmetic preserves local calendar behavior across daylight saving and legacy month overflow', t => {
  const previous = process.env.TZ;
  process.env.TZ = 'America/New_York';
  t.after(() => { if (previous === undefined) delete process.env.TZ; else process.env.TZ = previous; });
  fixed(t, '2026-03-08');
  assert.equal(utils.addDays('2026-03-08', 1), '2026-03-09');
  assert.equal(utils.daysDiff('2026-03-09'), 1);
  assert.equal(utils.addMonths('2026-01-31', 1), '2026-03-03');
});

test('backdated input uses local noon and today retains the actual event time', t => {
  fixed(t, '2026-07-25');
  assert.equal(utils.dateInputToUTC('2026-07-25'), new Date().toISOString());
  assert.equal(new Date(utils.dateInputToUTC('2026-07-20')).getHours(), 12);
  assert.equal(utils.toLocalDateInput('2026-07-20'), '2026-07-20');
});

test('reminder counts include overdue and today care once and leave records unchanged', t => {
  fixed(t, '2026-07-25');
  const items = [plant({ schedule: { nextDueOverrides: { watering: '2026-07-24', soil: '2026-07-25', fertilizer: '2026-08-01' } } })];
  const before = JSON.stringify(items);
  assert.deepEqual(reminders.getReminderSummary(items), { overdueCount: 1, dueTodayCount: 1, pendingCount: 2 });
  assert.equal(JSON.stringify(items), before);
});

test('urgency ranking places overdue care ahead of future care', t => {
  fixed(t, '2026-07-25');
  const overdue = plant({ schedule: { nextDueOverrides: { watering: '2026-07-20' } } });
  const future = plant({ schedule: { nextDueOverrides: { watering: '2026-08-20' } } });
  assert.ok(care.getUrgencyScore(overdue) > care.getUrgencyScore(future));
});
