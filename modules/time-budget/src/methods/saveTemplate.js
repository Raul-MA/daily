export function saveTemplate() {
        const name = this.dom.getElementById('templateName').value.trim();
        if (!name) {
            this.notify('Give this template a name.');
            this.dom.getElementById('templateName').focus();
            return;
        }

        const taskItems = this.dom.querySelectorAll('.task-item');
        const tasks = [];
        
        taskItems.forEach(item => {
            const taskName = item.querySelector('.task-name-input').value.trim();
            const duration = parseInt(item.querySelector('.task-duration-input').value);
            if (taskName && duration > 0) {
                tasks.push({ name: taskName, minutes: duration });
            }
        });

        if (tasks.length === 0) {
            this.notify('Add at least one complete task before saving.');
            return;
        }

        const templates = this.getTemplates();
        Object.defineProperty(templates, name, { value: tasks, enumerable: true, configurable: true, writable: true });
        try {
            this.saveTemplates(templates);
        } catch (error) {
            console.warn('Template could not be saved:', error);
            this.notify('This template could not be saved on this device.');
            return;
        }
        
        this.dom.getElementById('templateName').value = '';
        this.loadTemplateList();
        this.dom.getElementById('templateSelect').value = name;
        this.notify('“{name}” saved.', 3200, { name });
    }
