export function formatTime(timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        return new Intl.DateTimeFormat(undefined, {
            hour: 'numeric',
            minute: '2-digit'
        }).format(new Date(2000, 0, 1, hours, minutes));
    }
