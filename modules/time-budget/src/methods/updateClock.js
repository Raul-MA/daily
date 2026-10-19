export function updateClock() {
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        this.dom.getElementById('currentTime').textContent = currentTime;
        
        const goalDate = this.getSessionGoalDate();
        
        const diff = goalDate - now;
        const remainingMinutes = Math.floor(diff / 60000);
        const remainingSeconds = Math.floor((diff % 60000) / 1000);
        
        const remainingElement = this.dom.getElementById('timeRemaining');
        
        if (diff < 0) {
            remainingElement.textContent = this.copy("Time's up!");
            remainingElement.className = 'time-remaining danger';
        } else {
            const hours = Math.floor(remainingMinutes / 60);
            const mins = remainingMinutes % 60;
            remainingElement.textContent = hours > 0
                ? `${hours}h ${mins}m`
                : `${mins}m ${remainingSeconds}s`;
            
            if (remainingMinutes < 30) {
                remainingElement.className = 'time-remaining danger';
            } else if (remainingMinutes < 60) {
                remainingElement.className = 'time-remaining warning';
            } else {
                remainingElement.className = 'time-remaining';
            }
        }
    }
