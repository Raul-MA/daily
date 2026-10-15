export function isValidTemplateCollection(value) {
        return value
            && typeof value === 'object'
            && !Array.isArray(value)
            && Object.entries(value).every(([name, tasks]) =>
                name.trim().length > 0
                && name.length <= 60
                && Array.isArray(tasks)
                && tasks.length > 0
                && tasks.every(task =>
                    task
                    && typeof task.name === 'string'
                    && task.name.trim().length > 0
                    && task.name.length <= 120
                    && Number.isInteger(Number(task.minutes))
                    && Number(task.minutes) >= 1
                    && Number(task.minutes) <= 1440
                )
            );
    }
