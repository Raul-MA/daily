export function pauseTimer() {
        if (this.state.timerRunning && this.state.timerStartTime) {
            this.state.timerElapsed = Date.now() - this.state.timerStartTime;
        }
        this.state.timerRunning = false;
        this.syncTimerControls();
        clearInterval(this.state.intervalId);
        this.state.intervalId = null;
        if (this.state.autosaveIntervalId) {
            clearInterval(this.state.autosaveIntervalId);
            this.state.autosaveIntervalId = null;
        }
        
        
        this.cancelScheduledNotification();
        
        this.saveState();
    }
