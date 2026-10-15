export function startClock() {
        if (this.state.clockIntervalId) clearInterval(this.state.clockIntervalId);
        this.updateClock();
        this.state.clockIntervalId = setInterval(() => {
            this.updateClock();
        }, 1000);
    }
