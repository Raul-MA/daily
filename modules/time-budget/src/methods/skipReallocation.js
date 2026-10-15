export function skipReallocation() {
        this.dom.getElementById('reallocationModal').classList.add('hidden');
        this.notify('Budgets kept as planned.');
        this.moveToNextTask();
    }
