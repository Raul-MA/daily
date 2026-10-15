export function addRemainingTask() {
        const remainingTasksList = this.dom.getElementById('remainingTasksList');
        if (remainingTasksList.querySelector('.add-task-form')) return;

        const form = this.dom.createElement('div');
        form.className = 'remaining-task-item add-task-form';
        form.innerHTML = `
            <input type="text" class="task-name-input edit-inline" placeholder="Task name" maxlength="120" aria-label="Task name">
            <input type="number" class="task-duration-input edit-inline" min="1" max="1440" value="5" placeholder="Min" aria-label="Minutes">
            <div class="task-actions">
                <button type="button" class="icon-btn save-btn" data-time-click="app.saveNewRemainingTask(this)" aria-label="Save new task">✓</button>
                <button type="button" class="icon-btn cancel-btn" data-time-click="app.cancelNewTask(this)" aria-label="Cancel new task">✕</button>
            </div>
        `;
        remainingTasksList.appendChild(form);
        form.querySelector('.task-name-input').focus();
    }
