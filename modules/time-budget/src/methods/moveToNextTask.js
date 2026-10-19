export function moveToNextTask() {
        this.state.currentTaskIndex++;
        
        if (this.state.currentTaskIndex >= this.state.tasks.length) {
            this.finishBudget();
            return;
        }
        
        this.state.tasks[this.state.currentTaskIndex].status = 'active';
        this.state.timerElapsed = 0;
        this.state.timerStartTime = null;
        
        const progressCircle = this.dom.getElementById('progressCircle');
        const timeDisplay = this.dom.getElementById('timeDisplay');
        progressCircle.style.strokeDashoffset = '0';
        progressCircle.classList.remove('over');
        timeDisplay.textContent = '';
        timeDisplay.classList.remove('over');
        
        this.syncTimerControls();
        this.updateCurrentTask();
        this.updateRemainingTasks();
        this.saveState();
    }
