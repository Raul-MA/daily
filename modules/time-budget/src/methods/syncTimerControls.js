export function syncTimerControls() {
        const button = this.dom.getElementById('startPauseBtn');
        if (!button) return;
        if (this.state.timerRunning) {
            button.textContent = 'Pause focus';
        } else if (this.state.timerElapsed > 0) {
            button.textContent = 'Resume focus';
        } else {
            button.textContent = 'Start focus';
        }
    }
