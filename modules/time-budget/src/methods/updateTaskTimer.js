export function updateTaskTimer() {
        const elapsed = this.state.timerRunning 
            ? Date.now() - this.state.timerStartTime 
            : this.state.timerElapsed;
        
        const seconds = Math.floor(elapsed / 1000);
        const task = this.state.tasks[this.state.currentTaskIndex];
        const allocatedSeconds = task.allocatedMinutes * 60;
        const isOver = seconds > allocatedSeconds;
        
        const progressCircle = this.dom.getElementById('progressCircle');
        const timeDisplay = this.dom.getElementById('timeDisplay');
        const timerLabel = this.dom.querySelector('.progress-center span');
        
        if (isOver) {
            
            const overSeconds = seconds - allocatedSeconds;
            const overMinutes = Math.floor(overSeconds / 60);
            const overSecs = overSeconds % 60;
            
            progressCircle.style.strokeDashoffset = '534'; 
            progressCircle.classList.add('over');
            timeDisplay.textContent = `+${overMinutes}:${overSecs.toString().padStart(2, '0')}`;
            timeDisplay.classList.add('over');
            timerLabel.textContent = 'over budget';
            timerLabel.classList.add('over');
        } else {
            
            const remainingSeconds = allocatedSeconds - seconds;
            const progress = remainingSeconds / allocatedSeconds;
            const circumference = 2 * Math.PI * 85; 
            const offset = circumference * (1 - progress);
            
            progressCircle.style.strokeDashoffset = offset;
            progressCircle.classList.remove('over');
            
            const remainingMinutes = Math.floor(remainingSeconds / 60);
            const remainingSecs = remainingSeconds % 60;
            timeDisplay.textContent = `${remainingMinutes}:${remainingSecs.toString().padStart(2, '0')}`;
            timeDisplay.classList.remove('over');
            timerLabel.textContent = 'remaining';
            timerLabel.classList.remove('over');
        }
    }
