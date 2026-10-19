export async function requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            try {
                const permission = await Notification.requestPermission();
                this.state.notificationPermissionRequested = true;
                return permission === 'granted';
            } catch (error) {
                console.warn('Notification permission could not be requested:', error);
                return false;
            }
        }
        return 'Notification' in window && Notification.permission === 'granted';
    }
