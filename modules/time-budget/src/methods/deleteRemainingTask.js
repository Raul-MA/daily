export function deleteRemainingTask(index) {
        this.state.tasks.splice(index, 1);
        this.saveState();
        this.updateRemainingTasks();
    }
