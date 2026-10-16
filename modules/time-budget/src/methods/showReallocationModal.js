export function showReallocationModal(deficit) {
        this.requiredDeficit = Math.ceil(deficit);
        const modal = this.dom.getElementById('reallocationModal');
        this.dom.getElementById('deficitAmount').textContent = this.copy('{count} minutes', { count: Math.ceil(deficit) });
        
        const reallocationList = this.dom.getElementById('reallocationList');
        reallocationList.innerHTML = '';
        
        for (let i = this.state.currentTaskIndex + 1; i < this.state.tasks.length; i++) {
            const task = this.state.tasks[i];
            const item = this.dom.createElement('div');
            item.className = 'realloc-item';
            item.innerHTML = `
                <span class="task-name">${this.escapeHTML(task.name)}</span>
                <span class="current-duration">${task.allocatedMinutes} min</span>
                <input type="number" min="0" max="${task.allocatedMinutes - 1}" value="0" 
                       class="realloc-input" data-task-index="${i}" 
                       data-time-input="app.updateReallocationSummary(${Math.ceil(deficit)})"
                       aria-label="${this.copy('Minutes to take from {name}', { name: this.escapeHTML(task.name) })}">
            `;
            reallocationList.appendChild(item);
        }
        
        this.updateReallocationSummary(Math.ceil(deficit));
        modal.classList.remove('hidden');
    }
