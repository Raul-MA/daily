export function showNotification() {
        
        this.playSoundAlert();
        
        if ('Notification' in window && Notification.permission === 'granted') {
            const task = this.state.tasks[this.state.currentTaskIndex];
            new Notification('Time Budget', {
                body: `Time’s up for ${task.name}.`
            });
        }
    }
