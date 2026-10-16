export function showNotification() {
        
        this.playSoundAlert();
        
        if ('Notification' in window && Notification.permission === 'granted') {
            const task = this.state.tasks[this.state.currentTaskIndex];
            new Notification(this.copy("Time Budget"), {
                body: this.copy('Time’s up for {name}.', { name: task.name })
            });
        }
    }
