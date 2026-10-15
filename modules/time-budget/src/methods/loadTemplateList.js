export function loadTemplateList() {
        const templates = this.getTemplates();
        const select = this.dom.getElementById('templateSelect');
        
        
        select.innerHTML = '<option value="">Choose a template</option>';
        
        Object.keys(templates).forEach(name => {
            const option = this.dom.createElement('option');
            option.value = name;
            option.textContent = name;
            select.appendChild(option);
        });
    }
