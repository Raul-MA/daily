
export function onSubmit(event) {
    if (!event.target.matches('.practice-setup')) { event.preventDefault(); return; }
    event.preventDefault()
    if (!event.target.reportValidity()) return
    this.minutes = Number(event.target.elements.minutes.value)
    this.piano = event.target.elements.piano.checked
    this.start()
  }
