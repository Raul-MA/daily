export function getRemainingBudgetMinutes() {
        const goalDate = this.getSessionGoalDate();
        return (goalDate - Date.now()) / 60000;
    }
