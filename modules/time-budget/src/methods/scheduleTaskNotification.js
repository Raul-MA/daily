export function scheduleTaskNotification() {
        
        this.cancelScheduledNotification();
        
        
        const task = this.state.tasks[this.state.currentTaskIndex];
        const allocatedMs = task.allocatedMinutes * 60 * 1000;
        const remainingMs = allocatedMs - this.state.timerElapsed;
        
        if (remainingMs > 0) {
            
            this.state.notificationTimeoutId = setTimeout(() => {
                this.showNotification();
                this.state.notificationTimeoutId = null;
            }, remainingMs);
        }
    }
