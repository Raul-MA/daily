export function updateMoveButtons() {
        const items = this.dom.querySelectorAll('#taskList .task-item');
        items.forEach((item, index) => {
            const btns = item.querySelectorAll('.move-btn');
            if (btns[0]) btns[0].disabled = index === 0;
            if (btns[1]) btns[1].disabled = index === items.length - 1;
        });
    }
