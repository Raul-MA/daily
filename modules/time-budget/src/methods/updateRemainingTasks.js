export function updateRemainingTasks() {
        const remainingTasksList = this.dom.getElementById('remainingTasksList');
        remainingTasksList.innerHTML = '';

        const freeMinutes = this.getFreeRemainingMinutes();
        const isOverAllocated = freeMinutes < 0;
        const freeTimeCard = this.dom.createElement('div');
        freeTimeCard.className = `remaining-task-item free-time-card${isOverAllocated ? ' over-budget' : ''}`;
        freeTimeCard.innerHTML = `
            <span class="task-name">${isOverAllocated ? this.copy("Overallocated time") : this.copy("Free time remaining")}</span>
            <span class="task-duration">${this.formatMinutes(freeMinutes)}${isOverAllocated ? this.copy(" over") : ''}</span>
        `;
        remainingTasksList.appendChild(freeTimeCard);

        if (this.state.currentTaskIndex >= this.state.tasks.length - 1) {
            const empty = this.dom.createElement('p');
            empty.className = 'empty-queue';
            empty.textContent = this.copy("Nothing else queued. You’re on the last task.");
            remainingTasksList.appendChild(empty);
            return;
        }

        for (let i = this.state.currentTaskIndex + 1; i < this.state.tasks.length; i++) {
            const task = this.state.tasks[i];
            const isFirst = i === this.state.currentTaskIndex + 1;
            const isLast = i === this.state.tasks.length - 1;
            const item = this.dom.createElement('div');
            item.className = 'remaining-task-item user-task-card';
            item.dataset.taskIndex = String(i);
            item.innerHTML = `
                <div class="move-btns">
                    <button type="button" class="move-btn" data-time-click="app.moveRemainingTaskUp(${i})" ${isFirst ? 'disabled' : ''} aria-label="${this.copy("Move task up")}">▲</button>
                    <button type="button" class="move-btn" data-time-click="app.moveRemainingTaskDown(${i})" ${isLast ? 'disabled' : ''} aria-label="${this.copy("Move task down")}">▼</button>
                </div>
                <span class="task-name">${this.escapeHTML(task.name)}</span>
                <span class="task-duration">${task.allocatedMinutes} min</span>
                <div class="task-actions">
                    <button type="button" class="icon-btn edit-btn" data-time-click="app.editRemainingTask(${i})" aria-label="${this.copy('Edit {name}', { name: this.escapeHTML(task.name) })}">✎</button>
                    <button type="button" class="icon-btn delete-btn" data-time-click="app.deleteRemainingTask(${i})" aria-label="${this.copy('Delete {name}', { name: this.escapeHTML(task.name) })}">×</button>
                </div>
            `;
            remainingTasksList.appendChild(item);
        }
    }
