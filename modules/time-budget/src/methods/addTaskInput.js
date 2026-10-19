export function addTaskInput(shouldFocus = true) {
        const taskList = this.dom.getElementById('taskList');
        const taskItem = this.dom.createElement('div');
        taskItem.className = 'task-item';
        taskItem.innerHTML = `
            <div class="move-btns">
                <button type="button" class="move-btn" data-time-click="app.moveTaskUp(this)" title="${this.copy("Move up")}" aria-label="${this.copy("Move task up")}">▲</button>
                <button type="button" class="move-btn" data-time-click="app.moveTaskDown(this)" title="${this.copy("Move down")}" aria-label="${this.copy("Move task down")}">▼</button>
            </div>
            <input type="text" placeholder="${this.copy("What will you work on?")}" class="task-name-input" maxlength="120" aria-label="${this.copy("Task name")}">
            <input type="number" inputmode="numeric" placeholder="${this.copy("Min")}" min="1" max="1440" class="task-duration-input" data-time-input="app.updateRemainingAssignedTime()" aria-label="${this.copy("Minutes")}">
            <button type="button" class="danger" data-time-click="app.removeTaskInput(this)" aria-label="${this.copy("Remove task")}">×</button>
        `;
        taskList.appendChild(taskItem);
        this.updateMoveButtons();
        if (shouldFocus) {
            taskItem.querySelector('.task-name-input').focus();
        }
    }
