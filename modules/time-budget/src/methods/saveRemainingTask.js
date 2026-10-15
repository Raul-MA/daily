export function saveRemainingTask(index, btn) {
        const item = btn.closest('.remaining-task-item');
        const name = item.querySelector('.task-name-input').value.trim();
        const duration = parseInt(item.querySelector('.task-duration-input').value);
        if (!name || !(duration >= 1 && duration <= 1440)) {
            this.showBudgetError(item, 0);
            item.querySelector('.budget-error').textContent = 'Enter a task and 1–1440 minutes';
            return;
        }

        const delta = duration - this.state.tasks[index].allocatedMinutes;
        if (delta > 0) {
            const over = this.getPendingMinutes() + delta - this.getRemainingBudgetMinutes();
            if (over > 0) {
                this.showBudgetError(item, over);
                return;
            }
        }

        this.state.tasks[index].name = name;
        this.state.tasks[index].allocatedMinutes = duration;
        this.saveState();
        this.updateRemainingTasks();
    }
