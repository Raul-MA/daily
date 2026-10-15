export function toggleTimer() {
        if (this.state.timerRunning) {
            this.pauseTimer();
        } else {
            this.startTimer();
        }
    }
