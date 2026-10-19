import { restoreNotice } from '../notices.js';

export function notify(message, duration = 3200, params = {}) {
  this.ui.notice = { message, params, expires: Date.now() + duration, role: 'status' };
  restoreNotice(this);
}
