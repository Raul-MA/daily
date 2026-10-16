export function destroy(ctx) {
    ctx.timer.destroy()
    document.removeEventListener('click', ctx.handleOutsideClick)
    if (ctx.appShell) ctx.appShell.classList.remove('exercise-mode')
  }
