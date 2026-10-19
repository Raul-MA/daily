export function syncTimerControls() {
        const button = this.dom.getElementById('startPauseBtn');
        if (!button) return;
        if (this.state.timerRunning) {
            button.textContent = this.copy("Pause focus");
        } else if (this.state.timerElapsed > 0) {
            button.textContent = this.copy("Resume focus");
        } else {
            button.textContent = this.copy("Start focus");
        }
    }
