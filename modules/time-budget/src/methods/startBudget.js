export async function startBudget() {
        const goalTimeInput = this.dom.getElementById('goalTime').value;
        if (!goalTimeInput) {
            this.notify('Choose a finish time first.');
            this.dom.getElementById('goalTime').focus();
            return;
        }

        const taskItems = this.dom.querySelectorAll('.task-item');
        const tasks = [];
        
        taskItems.forEach(item => {
            const name = item.querySelector('.task-name-input').value.trim();
            const duration = Number.parseInt(item.querySelector('.task-duration-input').value, 10);
            if (name && duration > 0 && duration <= 1440) {
                tasks.push({
                    id: Date.now() + Math.random(),
                    name,
                    allocatedMinutes: duration,
                    actualMinutes: null,
                    status: 'pending'
                });
            }
        });

        if (tasks.length === 0) {
            this.notify('Add at least one task with a time budget.');
            this.dom.querySelector('.task-name-input')?.focus();
            return;
        }

        const availableMinutes = Math.floor((this.getGoalDate(goalTimeInput) - Date.now()) / 60000);
        const plannedMinutes = tasks.reduce((sum, task) => sum + task.allocatedMinutes, 0);
        if (plannedMinutes > availableMinutes) {
            this.notify('Your plan is {count} minutes over. Shorten a task or move the finish time.', 3200, { count: plannedMinutes - availableMinutes });
            this.dom.getElementById('remainingAssignedTime').scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        
        if (!this.state.notificationPermissionRequested && 'Notification' in window && Notification.permission === 'default') {
            await this.requestNotificationPermission();
        }

        this.state.goalTime = goalTimeInput;
        this.state.tasks = tasks;
        this.state.startTime = Date.now();
        this.state.currentTaskIndex = 0;
        this.state.timerRunning = false;
        this.state.timerStartTime = null;
        this.state.timerElapsed = 0;
        this.state.tasks[0].status = 'active';

        this.saveState();
        this.showTimerScreen();
    }
