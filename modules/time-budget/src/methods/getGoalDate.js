export function getGoalDate(timeString, referenceDate = new Date()) {
        if (!this.isValidTimeString(timeString)) return null;
        const [hours, minutes] = timeString.split(':').map(Number);
        const goalDate = new Date(referenceDate);
        goalDate.setHours(hours, minutes, 0, 0);
        if (goalDate <= referenceDate) {
            goalDate.setDate(goalDate.getDate() + 1);
        }
        return goalDate;
    }
