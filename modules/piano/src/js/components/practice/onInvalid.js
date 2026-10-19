
export function onInvalid(event) {
    const disclosure = event.target.closest('details')
    if (disclosure) disclosure.open = true
  }
