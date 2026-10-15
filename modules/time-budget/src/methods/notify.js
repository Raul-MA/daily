export function notify(message, duration = 3200) {
        const toast = this.dom.getElementById('toast');
        if (!toast) return;
        toast.textContent = message;
        toast.classList.remove('hidden');
        clearTimeout(this.toastTimeoutId);
        this.toastTimeoutId = setTimeout(() => toast.classList.add('hidden'), duration);
    }
