export function moveTaskDown(btn) {
        const item = btn.closest('.task-item');
        const next = item.nextElementSibling;
        if (next) {
            item.parentElement.insertBefore(next, item);
            this.updateMoveButtons();
            this.updateRemainingAssignedTime();
        }
    }
