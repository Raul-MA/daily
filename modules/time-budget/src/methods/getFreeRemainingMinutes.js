export function getFreeRemainingMinutes() {
        return Math.floor(this.getRemainingBudgetMinutes() - this.getPendingMinutes());
    }
