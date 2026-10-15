export function moveTaskUp(btn) {
        const item = btn.closest('.task-item');
        const prev = item.previousElementSibling;
        if (prev) {
            item.parentElement.insertBefore(item, prev);
            this.updateMoveButtons();
            this.updateRemainingAssignedTime();
        }
    }
