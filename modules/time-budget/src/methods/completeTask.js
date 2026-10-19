export function completeTask() {
        const elapsed = this.state.timerRunning 
            ? Date.now() - this.state.timerStartTime 
            : this.state.timerElapsed;
        
        const actualMinutes = elapsed / 60000;
        const task = this.state.tasks[this.state.currentTaskIndex];
        task.actualMinutes = actualMinutes;
        task.status = 'completed';
        
        this.state.timerElapsed = elapsed;
        this.state.timerRunning = false;
        clearInterval(this.state.intervalId);
        this.cancelScheduledNotification();
        
        const deficit = actualMinutes - task.allocatedMinutes;
        
        if (deficit > 0 && this.state.currentTaskIndex < this.state.tasks.length - 1) {
            this.saveState();
            this.syncTimerControls();
            this.showReallocationModal(deficit);
        } else {
            this.moveToNextTask();
        }
    }
