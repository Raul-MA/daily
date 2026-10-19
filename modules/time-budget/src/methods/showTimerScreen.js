export function showTimerScreen() {
        this.dom.getElementById('setupScreen').classList.add('hidden');
        this.dom.getElementById('timerScreen').classList.remove('hidden');
        
        this.dom.getElementById('goalTimeDisplay').textContent = this.formatTime(this.state.goalTime);
        this.syncTimerControls();
        this.updateCurrentTask();
        this.updateRemainingTasks();
        this.startClock();
        window.scrollTo({ top: 0, behavior: 'auto' });
    }
