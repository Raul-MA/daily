export function isValidTimeString(timeString) {
        if (typeof timeString !== 'string' || !/^\d{2}:\d{2}$/.test(timeString)) return false;
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
    }
