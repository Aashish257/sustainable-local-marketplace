import { create } from "zustand";
import apiClient from "../services/apiClient";

// Server is the source of truth (Notification collection). The store keeps a
// local copy for the bell and updates it optimistically, then syncs with the API.
const normalize = (n) => ({
    ...n,
    id: n._id || n.id || Date.now().toString(),
    isRead: !!n.isRead,
    createdAt: n.createdAt || new Date().toISOString(),
});

const useNotificationStore = create((set, get) => ({
    notifications: [],

    // Load the latest notifications after login / page refresh
    fetchNotifications: async () => {
        try {
            const res = await apiClient.get("/notifications", { params: { limit: 20 } });
            set({ notifications: (res.data.data?.items || []).map(normalize) });
        } catch {
            // keep whatever we have; the bell still works from live socket events
        }
    },

    // Live socket event (already saved on the server)
    addNotification: (notification) => {
        const n = normalize(notification);
        set((state) => ({
            notifications: [n, ...state.notifications.filter((x) => x.id !== n.id)],
        }));
    },

    markAsRead: (id) => {
        set((state) => ({
            notifications: state.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
        }));
        apiClient.patch(`/notifications/${id}/read`).catch(() => {});
    },

    markAllAsRead: () => {
        set((state) => ({ notifications: state.notifications.map((n) => ({ ...n, isRead: true })) }));
        apiClient.patch("/notifications/read-all").catch(() => {});
    },

    // Deletes on the server too
    clearAll: () => {
        set({ notifications: [] });
        apiClient.delete("/notifications").catch(() => {});
    },

    // Local only: used on logout so the next user doesn't see these
    reset: () => set({ notifications: [] }),

    getUnreadCount: () => get().notifications.filter((n) => !n.isRead).length,
}));

export default useNotificationStore;
