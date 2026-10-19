export function startTimer() {
        if (this.state.intervalId) clearInterval(this.state.intervalId);
        this.state.timerRunning = true;
        this.state.timerStartTime = Date.now() - this.state.timerElapsed;
        this.saveState();
        this.syncTimerControls();
        
        this.state.intervalId = setInterval(() => {
            this.updateTaskTimer();
        }, 1000);
        
        
        this.scheduleTaskNotification();
    }
