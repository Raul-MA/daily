export function updateSetupTimeRemaining() {
        const goalTimeInput = this.dom.getElementById('goalTime').value;
        const display = this.dom.getElementById('setupTimeRemaining');
        
        if (!goalTimeInput) {
            display.classList.add('hidden');
            return;
        }
        
        const now = new Date();
        const goalDate = this.getGoalDate(goalTimeInput, now);
        
        const diff = goalDate - now;
        const remainingMinutes = Math.floor(diff / 60000);
        
        if (remainingMinutes < 0) {
            display.textContent = 'Goal time has passed';
        } else {
            const hours = Math.floor(remainingMinutes / 60);
            const mins = remainingMinutes % 60;
            display.textContent = `${hours}h ${mins}m available from now`;
        }
        
        display.classList.remove('hidden');
    }
