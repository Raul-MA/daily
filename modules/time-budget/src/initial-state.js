export function initialState() { return {
        goalTime: null,
        startTime: null,
        tasks: [],
        currentTaskIndex: 0,
        timerRunning: false,
        timerStartTime: null,
        timerElapsed: 0,
        intervalId: null,
        clockIntervalId: null,
        autosaveIntervalId: null,
        notificationTimeoutId: null,
        deferredInstallPrompt: null,
        notificationPermissionRequested: false
    }; }
