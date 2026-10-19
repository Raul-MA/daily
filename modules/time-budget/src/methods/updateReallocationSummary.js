export function updateReallocationSummary(requiredDeficit) {
        const inputs = this.dom.querySelectorAll('.realloc-input');
        let totalReduction = 0;
        let valid = true;
        
        inputs.forEach(input => {
            const taskIndex = parseInt(input.dataset.taskIndex);
            const task = this.state.tasks[taskIndex];
            const reduction = Number(input.value);
            totalReduction += reduction;
            
            if (!Number.isInteger(reduction) || reduction < 0 || reduction > task.allocatedMinutes - 1) {
                valid = false;
            }
        });
        
        const summary = this.dom.getElementById('reallocSummary');
        const applyBtn = this.dom.getElementById('applyReallocBtn');
        
        if (totalReduction === requiredDeficit && valid) {
            summary.className = 'realloc-summary valid';
            summary.textContent = this.copy('✓ Total reduction: {total} minutes (matches deficit)', { total: totalReduction });
            applyBtn.disabled = false;
        } else {
            summary.className = 'realloc-summary invalid';
            summary.textContent = this.copy('Total reduction: {total} minutes (need {required})', { total: totalReduction, required: requiredDeficit });
            applyBtn.disabled = true;
        }
    }
