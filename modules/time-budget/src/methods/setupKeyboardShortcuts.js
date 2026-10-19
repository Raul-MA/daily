function isInput(target) {
    return target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement;
}

export function setupKeyboardShortcuts() {
        this.dom.addEventListener('keydown', (event) => {
            if (this.dom.getElementById('timerScreen').closest('[data-menu-panel][hidden]')) return;
            const target = event.target;
            const isTyping = isInput(target);

            if (event.code === 'Space' && !isTyping && !this.dom.getElementById('timerScreen').classList.contains('hidden')) {
                event.preventDefault();
                this.keyboardAction(() => this.toggleTimer());
            }

            if (event.key === 'Escape' && !this.dom.getElementById('reallocationModal').classList.contains('hidden')) {
                this.keyboardAction(() => this.skipReallocation());
            }
        });
    }
