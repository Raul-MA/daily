export function loadTemplate() {
        const select = this.dom.getElementById('templateSelect');
        const templateName = select.value;
        if (!templateName) return;

        const templates = this.getTemplates();
        const tasks = templates[templateName];
        
        if (tasks) {
            const taskList = this.dom.getElementById('taskList');
            taskList.innerHTML = '';
            
            tasks.forEach(task => {
                this.addTaskInput(false);
                const lastItem = taskList.lastElementChild;
                lastItem.querySelector('.task-name-input').value = task.name;
                lastItem.querySelector('.task-duration-input').value = task.minutes;
            });
            this.updateMoveButtons();
            this.updateRemainingAssignedTime();
        }
    }
