export function saveNewRemainingTask(btn) {
        const item = btn.closest('.add-task-form');
        const name = item.querySelector('.task-name-input').value.trim();
        const duration = parseInt(item.querySelector('.task-duration-input').value);
        if (!name || !(duration >= 1 && duration <= 1440)) {
            this.showBudgetError(item, 0);
            item.querySelector('.budget-error').textContent = 'Enter a task and 1–1440 minutes';
            return;
        }

        const over = this.getPendingMinutes() + duration - this.getRemainingBudgetMinutes();
        if (over > 0) {
            this.showBudgetError(item, over);
            return;
        }

        this.state.tasks.push({
            id: Date.now() + Math.random(),
            name,
            allocatedMinutes: duration,
            actualMinutes: null,
            status: 'pending'
        });
        this.saveState();
        this.updateRemainingTasks();
    }
