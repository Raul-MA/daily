export function updateCurrentTask() {
        const task = this.state.tasks[this.state.currentTaskIndex];
        this.dom.getElementById('currentTaskName').textContent = task.name;
        this.dom.getElementById('allocatedTime').textContent = this.copy('{count} minutes', { count: task.allocatedMinutes });
        this.updateTaskTimer();
    }
