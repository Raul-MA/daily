export function getPendingMinutes() {
        const elapsedMs = this.state.timerRunning
            ? Date.now() - this.state.timerStartTime
            : this.state.timerElapsed;
        const currentTask = this.state.tasks[this.state.currentTaskIndex];
        const currentRemaining = Math.max(0, currentTask.allocatedMinutes - elapsedMs / 60000);
        const pendingSum = this.state.tasks
            .slice(this.state.currentTaskIndex + 1)
            .reduce((sum, t) => sum + t.allocatedMinutes, 0);
        return currentRemaining + pendingSum;
    }
