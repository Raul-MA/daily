export function resetApp() {
        this.clearSession();
        if (this.state.intervalId) clearInterval(this.state.intervalId);
        if (this.state.clockIntervalId) clearInterval(this.state.clockIntervalId);
        if (this.state.autosaveIntervalId) clearInterval(this.state.autosaveIntervalId);
        if (this.setupRemainingIntervalId) clearInterval(this.setupRemainingIntervalId);
        this.cancelScheduledNotification();

        const savedTasks = this.state.tasks.map(t => ({ name: t.name, allocatedMinutes: t.allocatedMinutes }));
        const savedGoalTime = this.state.goalTime;

        this.state = {
            goalTime: null,
            startTime: null,
            tasks: [],
            currentTaskIndex: 0,
            timerRunning: false,
            timerStartTime: null,
            timerElapsed: 0,
            intervalId: null,
            clockIntervalId: null,
            autosaveIntervalId: null,
            notificationTimeoutId: null,
            deferredInstallPrompt: this.state.deferredInstallPrompt,
            notificationPermissionRequested: this.state.notificationPermissionRequested
        };

        this.dom.getElementById('timerScreen').classList.add('hidden');
        this.dom.getElementById('setupScreen').classList.remove('hidden');
        this.dom.getElementById('reallocationModal').classList.add('hidden');
        this.syncTimerControls();
        this.dom.getElementById('goalTime').value = savedGoalTime || '';
        this.dom.getElementById('taskList').innerHTML = '';

        savedTasks.forEach(task => {
            this.addTaskInput(false);
            const items = this.dom.querySelectorAll('#taskList .task-item');
            const last = items[items.length - 1];
            last.querySelector('.task-name-input').value = task.name;
            last.querySelector('.task-duration-input').value = task.allocatedMinutes;
        });

        this.updateSetupTimeRemaining();
        this.updateRemainingAssignedTime();
        if (savedGoalTime) {
            this.setupRemainingIntervalId = setInterval(() => {
                this.updateSetupTimeRemaining();
                this.updateRemainingAssignedTime();
            }, 1000);
        }
    }
