import { commitPractice } from './persistence.js';
export function start() {
  commitPractice(this, 'startSession', { lessonId: this.lesson().id, minutes: this.minutes, piano: this.piano });
  this.stopClock();
  this.phase = 'session';
  this.pauseReason = '';
  this.reviewOpen = false;
  this.interval = setInterval(this.tick, 200);
  this.render(true);
}
