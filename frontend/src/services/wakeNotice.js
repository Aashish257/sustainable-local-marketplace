import toast from 'react-hot-toast';

// Free hosting (Render) sleeps when idle; the first request can take up to a minute.
// If any request is still pending after WAKE_DELAY_MS, tell the user once instead of looking broken.
export const WAKE_DELAY_MS = 4000;
export const WAKE_MESSAGE = 'Waking up the server… free hosting sleeps when idle, this can take up to a minute.';
const TOAST_ID = 'wake';

let pending = 0;
let timer = null;
let shown = false;

export const trackRequestStart = () => {
    pending += 1;
    if (!timer && !shown) {
        timer = setTimeout(() => {
            timer = null;
            if (pending > 0) {
                shown = true;
                toast.loading(WAKE_MESSAGE, { id: TOAST_ID });
            }
        }, WAKE_DELAY_MS);
    }
};

export const trackRequestEnd = () => {
    pending = Math.max(0, pending - 1);
    if (pending > 0) return;
    if (timer) {
        clearTimeout(timer);
        timer = null;
    }
    if (shown) {
        shown = false;
        toast.dismiss(TOAST_ID);
    }
};

// Test helper: start each test from a clean state
export const resetWakeNotice = () => {
    pending = 0;
    shown = false;
    if (timer) clearTimeout(timer);
    timer = null;
};
