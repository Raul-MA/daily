export function setupGoalTimeListener() {
        const goalTimeInput = this.dom.getElementById('goalTime');
        const update = () => {
            this.updateSetupTimeRemaining();
            this.updateRemainingAssignedTime();
            if (this.setupRemainingIntervalId) {
                clearInterval(this.setupRemainingIntervalId);
            }
            this.setupRemainingIntervalId = setInterval(() => {
                this.updateSetupTimeRemaining();
                this.updateRemainingAssignedTime();
            }, 1000);
        };
        goalTimeInput.addEventListener('input', update);
        goalTimeInput.addEventListener('change', update);
    }
