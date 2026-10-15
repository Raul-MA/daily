export function applyReallocation() {
        this.updateReallocationSummary(this.requiredDeficit);
        if (this.dom.getElementById('applyReallocBtn').disabled) return;
        const inputs = this.dom.querySelectorAll('.realloc-input');
        
        inputs.forEach(input => {
            const taskIndex = parseInt(input.dataset.taskIndex);
            const reduction = parseInt(input.value) || 0;
            this.state.tasks[taskIndex].allocatedMinutes -= reduction;
        });
        
        this.dom.getElementById('reallocationModal').classList.add('hidden');
        this.moveToNextTask();
    }
