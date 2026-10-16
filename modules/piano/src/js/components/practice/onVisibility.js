export function onVisibility() {
  this.lastTime = Date.now();
  this.tick();
}
