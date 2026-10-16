export function deleteTemplate() {
        const select = this.dom.getElementById('templateSelect');
        const name = select.value;
        if (!name) {
            this.notify('Choose a template to delete.');
            return;
        }
        const templates = this.getTemplates();
        if (!(name in templates)) return;
        delete templates[name];
        this.saveTemplates(templates);
        this.loadTemplateList();
        this.notify('“{name}” deleted.', 3200, { name });
    }
