export function updateCurrentTask() {
        const task = this.state.tasks[this.state.currentTaskIndex];
        this.dom.getElementById('currentTaskName').textContent = task.name;
        this.dom.getElementById('allocatedTime').textContent = `${task.allocatedMinutes} minutes`;
        this.updateTaskTimer();
    }
