export function addTaskInput(shouldFocus = true) {
        const taskList = this.dom.getElementById('taskList');
        const taskItem = this.dom.createElement('div');
        taskItem.className = 'task-item';
        taskItem.innerHTML = `
            <div class="move-btns">
                <button type="button" class="move-btn" data-time-click="app.moveTaskUp(this)" title="Move up" aria-label="Move task up">▲</button>
                <button type="button" class="move-btn" data-time-click="app.moveTaskDown(this)" title="Move down" aria-label="Move task down">▼</button>
            </div>
            <input type="text" placeholder="What will you work on?" class="task-name-input" maxlength="120" aria-label="Task name">
            <input type="number" inputmode="numeric" placeholder="Min" min="1" max="1440" class="task-duration-input" data-time-input="app.updateRemainingAssignedTime()" aria-label="Minutes">
            <button type="button" class="danger" data-time-click="app.removeTaskInput(this)" aria-label="Remove task">×</button>
        `;
        taskList.appendChild(taskItem);
        this.updateMoveButtons();
        if (shouldFocus) {
            taskItem.querySelector('.task-name-input').focus();
        }
    }
