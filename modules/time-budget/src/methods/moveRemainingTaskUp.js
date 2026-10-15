export function moveRemainingTaskUp(index) {
        if (index <= this.state.currentTaskIndex + 1) return;
        const temp = this.state.tasks[index];
        this.state.tasks[index] = this.state.tasks[index - 1];
        this.state.tasks[index - 1] = temp;
        this.updateRemainingTasks();
        this.saveState();
    }
