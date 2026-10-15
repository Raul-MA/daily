export function removeTaskInput(button) {
        button.closest('.task-item')?.remove();
        if (!this.dom.querySelector('#taskList .task-item')) {
            this.addTaskInput();
        }
        this.updateRemainingAssignedTime();
        this.updateMoveButtons();
    }
