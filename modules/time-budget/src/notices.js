export function restoreNotice(app) {
  clearTimeout(app.toastTimeoutId);
  const notice = app.ui.notice;
  const toast = app.dom.getElementById('toast');
  if (!toast) return;
  if (!notice || notice.expires <= Date.now()) {
    app.ui.notice = null;
    toast.classList.add('hidden');
    return;
  }
  toast.textContent = app.message(notice.message, notice.params);
  toast.setAttribute('role', notice.role);
  toast.classList.remove('hidden');
  app.toastTimeoutId = setTimeout(() => restoreNotice(app), notice.expires - Date.now());
}
