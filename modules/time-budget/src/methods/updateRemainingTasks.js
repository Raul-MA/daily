export function updateRemainingTasks() {
        const remainingTasksList = this.dom.getElementById('remainingTasksList');
        remainingTasksList.innerHTML = '';

        const freeMinutes = this.getFreeRemainingMinutes();
        const isOverAllocated = freeMinutes < 0;
        const freeTimeCard = this.dom.createElement('div');
        freeTimeCard.className = `remaining-task-item free-time-card${isOverAllocated ? ' over-budget' : ''}`;
        freeTimeCard.innerHTML = `
            <span class="task-name">${isOverAllocated ? 'Overallocated time' : 'Free time remaining'}</span>
            <span class="task-duration">${this.formatMinutes(freeMinutes)}${isOverAllocated ? ' over' : ''}</span>
        `;
        remainingTasksList.appendChild(freeTimeCard);

        if (this.state.currentTaskIndex >= this.state.tasks.length - 1) {
            const empty = this.dom.createElement('p');
            empty.className = 'empty-queue';
            empty.textContent = 'Nothing else queued. You’re on the last task.';
            remainingTasksList.appendChild(empty);
            return;
        }

        for (let i = this.state.currentTaskIndex + 1; i < this.state.tasks.length; i++) {
            const task = this.state.tasks[i];
            const isFirst = i === this.state.currentTaskIndex + 1;
            const isLast = i === this.state.tasks.length - 1;
            const item = this.dom.createElement('div');
            item.className = 'remaining-task-item user-task-card';
            item.innerHTML = `
                <div class="move-btns">
                    <button type="button" class="move-btn" data-time-click="app.moveRemainingTaskUp(${i})" ${isFirst ? 'disabled' : ''} aria-label="Move task up">▲</button>
                    <button type="button" class="move-btn" data-time-click="app.moveRemainingTaskDown(${i})" ${isLast ? 'disabled' : ''} aria-label="Move task down">▼</button>
                </div>
                <span class="task-name">${this.escapeHTML(task.name)}</span>
                <span class="task-duration">${task.allocatedMinutes} min</span>
                <div class="task-actions">
                    <button type="button" class="icon-btn edit-btn" data-time-click="app.editRemainingTask(${i})" aria-label="Edit ${this.escapeHTML(task.name)}">✎</button>
                    <button type="button" class="icon-btn delete-btn" data-time-click="app.deleteRemainingTask(${i})" aria-label="Delete ${this.escapeHTML(task.name)}">×</button>
                </div>
            `;
            remainingTasksList.appendChild(item);
        }
    }
