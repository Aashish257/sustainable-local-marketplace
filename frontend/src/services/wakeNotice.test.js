import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('react-hot-toast', () => ({
    default: { loading: vi.fn(), dismiss: vi.fn() },
}));

import toast from 'react-hot-toast';
import { trackRequestStart, trackRequestEnd, resetWakeNotice, WAKE_DELAY_MS, WAKE_MESSAGE } from './wakeNotice';
import apiClient from './apiClient';

describe('wake notice for sleeping free-tier server', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        resetWakeNotice();
        vi.clearAllMocks();
    });
    afterEach(() => vi.useRealTimers());

    it('shows the notice once when a request takes over 4s', () => {
        expect(WAKE_DELAY_MS).toBe(4000);
        trackRequestStart();
        vi.advanceTimersByTime(4000);
        expect(toast.loading).toHaveBeenCalledTimes(1);
        expect(toast.loading).toHaveBeenCalledWith(WAKE_MESSAGE, { id: 'wake' });
        expect(WAKE_MESSAGE).toBe('Waking up the server… free hosting sleeps when idle, this can take up to a minute.');
    });

    it('does not show for fast requests', () => {
        trackRequestStart();
        vi.advanceTimersByTime(3000);
        trackRequestEnd();
        vi.advanceTimersByTime(5000);
        expect(toast.loading).not.toHaveBeenCalled();
    });

    it('shows only once for many slow requests', () => {
        trackRequestStart();
        trackRequestStart();
        trackRequestStart();
        vi.advanceTimersByTime(10000);
        expect(toast.loading).toHaveBeenCalledTimes(1);
    });

    it('dismisses when all requests finish', () => {
        trackRequestStart();
        trackRequestStart();
        vi.advanceTimersByTime(4000);
        trackRequestEnd();
        expect(toast.dismiss).not.toHaveBeenCalled();
        trackRequestEnd();
        expect(toast.dismiss).toHaveBeenCalledWith('wake');
    });

    it('api client waits long enough for a cold start', () => {
        expect(apiClient.defaults.timeout).toBeGreaterThanOrEqual(60000);
    });
});
