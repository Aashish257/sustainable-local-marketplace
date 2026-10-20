import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../services/apiClient', () => ({
    default: {
        get: vi.fn(),
        patch: vi.fn().mockResolvedValue({}),
        delete: vi.fn().mockResolvedValue({}),
    },
}));

import useNotificationStore from './notificationStore';
import apiClient from '../services/apiClient';

const store = () => useNotificationStore.getState();

beforeEach(() => {
    vi.clearAllMocks();
    useNotificationStore.setState({ notifications: [] });
});

describe('notificationStore', () => {
    it('loads saved notifications from the API', async () => {
        apiClient.get.mockResolvedValue({ data: { data: { items: [{ _id: 'a', message: 'hi', isRead: false }] } } });
        await store().fetchNotifications();
        expect(store().notifications).toHaveLength(1);
        expect(store().notifications[0].id).toBe('a');
        expect(store().getUnreadCount()).toBe(1);
    });

    it('does not duplicate a live notification it already has', () => {
        store().addNotification({ _id: 'x', message: 'one' });
        store().addNotification({ _id: 'x', message: 'one' });
        expect(store().notifications).toHaveLength(1);
    });

    it('marks one as read locally and on the server', () => {
        store().addNotification({ _id: 'x', message: 'one' });
        store().markAsRead('x');
        expect(store().getUnreadCount()).toBe(0);
        expect(apiClient.patch).toHaveBeenCalledWith('/notifications/x/read');
    });

    it('reset() on logout clears only the local copy (server keeps them)', () => {
        store().addNotification({ _id: 'x', message: 'one' });
        store().reset();
        expect(store().notifications).toHaveLength(0);
        expect(apiClient.delete).not.toHaveBeenCalled();
    });

    it('clearAll() deletes on the server', () => {
        store().clearAll();
        expect(apiClient.delete).toHaveBeenCalledWith('/notifications');
    });
});
