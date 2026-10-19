export function isValidTask(task) {
        return task
            && typeof task.name === 'string'
            && task.name.trim().length > 0
            && Number.isFinite(Number(task.allocatedMinutes))
            && Number(task.allocatedMinutes) > 0;
    }
