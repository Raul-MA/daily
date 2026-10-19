export function cancelScheduledNotification() {
        if (this.state.notificationTimeoutId) {
            clearTimeout(this.state.notificationTimeoutId);
            this.state.notificationTimeoutId = null;
        }
    }
