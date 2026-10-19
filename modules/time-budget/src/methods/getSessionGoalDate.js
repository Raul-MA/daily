export function getSessionGoalDate() {
        const sessionStart = this.state.startTime ? new Date(this.state.startTime) : new Date();
        return this.getGoalDate(this.state.goalTime, sessionStart);
    }
