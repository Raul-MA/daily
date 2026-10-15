export function editRemainingTask(index) {
        const task = this.state.tasks[index];
        const itemIndex = index - this.state.currentTaskIndex - 1;
        const item = this.dom.querySelectorAll('#remainingTasksList .remaining-task-item.user-task-card')[itemIndex];
        if (!item) return;
        item.classList.add('editing');
        item.innerHTML = `
            <input type="text" class="task-name-input edit-inline" value="${this.escapeHTML(task.name)}" placeholder="Task name" maxlength="120" aria-label="Task name">
            <input type="number" class="task-duration-input edit-inline" min="1" max="1440" value="${task.allocatedMinutes}" placeholder="Min" aria-label="Minutes">
            <div class="task-actions">
                <button type="button" class="icon-btn save-btn" data-time-click="app.saveRemainingTask(${index}, this)" aria-label="Save changes">✓</button>
                <button type="button" class="icon-btn cancel-btn" data-time-click="app.updateRemainingTasks()" aria-label="Cancel editing">✕</button>
            </div>
        `;
        item.querySelector('.task-name-input').focus();
    }
