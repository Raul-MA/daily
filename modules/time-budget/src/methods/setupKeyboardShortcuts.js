export function setupKeyboardShortcuts() {
        this.dom.addEventListener('keydown', (event) => {
            const target = event.target;
            const isTyping = target instanceof HTMLInputElement
                || target instanceof HTMLSelectElement
                || target instanceof HTMLTextAreaElement;

            if (event.code === 'Space' && !isTyping && !this.dom.getElementById('timerScreen').classList.contains('hidden')) {
                event.preventDefault();
                this.keyboardAction(() => this.toggleTimer());
            }

            if (event.key === 'Escape' && !this.dom.getElementById('reallocationModal').classList.contains('hidden')) {
                this.keyboardAction(() => this.skipReallocation());
            }
        });
    }
