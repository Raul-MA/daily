export function updateRemainingAssignedTime() {
        const goalTimeInput = this.dom.getElementById('goalTime').value;
        const display = this.dom.getElementById('remainingAssignedTime');
        
        if (!goalTimeInput) {
            display.classList.add('hidden');
            return;
        }
        
        
        const now = new Date();
        const goalDate = this.getGoalDate(goalTimeInput, now);
        
        const diff = goalDate - now;
        const totalRemainingMinutes = Math.floor(diff / 60000);
        
        if (totalRemainingMinutes < 0) {
            display.classList.add('hidden');
            return;
        }
        
        
        const taskItems = this.dom.querySelectorAll('.task-item');
        let totalAllocated = 0;
        taskItems.forEach(item => {
            const duration = parseInt(item.querySelector('.task-duration-input').value) || 0;
            if (duration > 0) {
                totalAllocated += duration;
            }
        });
        
        const remainingAssigned = totalRemainingMinutes - totalAllocated;
        
        
        display.replaceChildren();
        const summary = this.dom.createElement('div');
        summary.className = 'assigned-time-header';
        const label = this.dom.createElement('span');
        label.textContent = remainingAssigned < 0 ? this.copy("Plan is over by") : this.copy("Unassigned time");
        const value = this.dom.createElement('strong');
        value.textContent = `${Math.abs(remainingAssigned)} min`;
        summary.append(label, value);
        display.appendChild(summary);
        display.classList.remove('hidden');
        
        
        const addButton = this.dom.querySelector('.add-task-btn');
        if (addButton) {
            if (remainingAssigned <= 0) {
                addButton.disabled = true;
                addButton.title = this.copy("No remaining time to assign");
            } else {
                addButton.disabled = false;
                addButton.title = '';
            }
        }
        
        
        if (remainingAssigned < 0) {
            display.classList.add('over-budget');
        } else {
            display.classList.remove('over-budget');
        }
    }
