
export function hasPrompts() { return this.block === 1 || (this.block === 2 && this.lesson().application.sequence?.length > 0); }
