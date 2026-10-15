export function formatMinutes(totalMinutes) {
        const minutes = Math.abs(Math.floor(totalMinutes));
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        if (hours === 0) return `${remainingMinutes} min`;
        if (remainingMinutes === 0) return `${hours}h`;
        return `${hours}h ${remainingMinutes}m`;
    }
