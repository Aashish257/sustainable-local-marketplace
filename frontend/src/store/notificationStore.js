import { create } from "zustand";

const useNotificationStore = create((set, get) => ({
    // STATE
    notifications: [],

    // ACTION 1: Add a new notification (newest first)
    addNotification: (notification) => {
        const newNotification = {
            id: Date.now().toString(),           // Hint: use Date.now().toString()
            isRead: false,       // Hint: should start as false
            createdAt: new Date().toISOString(),    // Hint: new Date().toISOString()
            ...notification,   // spread the incoming data (type, message, link)
        };
        set((state) => ({
            notifications: [newNotification, ...state.notifications]
        }));
    },

    // ACTION 2: Mark one notification as read
    markAsRead: (id) => {
        set((state) => ({
            notifications: state.notifications.map((n) =>
                n.id === id ? { ...n, isRead: true } : n
            )
        }));
    },

    // ACTION 3: Mark ALL as read
    markAllAsRead: () => {
        set((state) => ({
            notifications: state.notifications.map((n) => ({ ...n, isRead: true }))
        }));
    },

    // ACTION 4: Clear all notifications
    clearAll: () => set({ notifications: [] }),

    // DERIVED VALUE: Count unread
    // This is a "selector" — it's a function that reads state
    getUnreadCount: () => {
        return get().notifications.filter((n) => n.isRead === false).length;
    },
}));

export default useNotificationStore;
