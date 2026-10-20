import { create } from "zustand";
import { persist } from "zustand/middleware";
import { connectSocket, disconnectSocket } from "../services/socket";
import { useCartStore } from "../modules/cart/store/cartStore";
import useNotificationStore from "./notificationStore";

const useAuthStore = create(
    persist((set, get) => ({
        user: null,
        token: null,
        isAuthenticated: false,
        login: (user, token) => {
            connectSocket(token); // Connect socket on login
            set({ user, token, isAuthenticated: true });
        },
        logout: () => {
            // Revoke the token on the server (bumps tokenVersion). Plain fetch, not apiClient:
            // avoids a circular import and the 401 redirect if the token is already invalid.
            const token = get().token;
            if (token) {
                fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/logout`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                }).catch(() => {});
            }

            disconnectSocket(); // Clean disconnect on logout

            // Clear other stores (local only: notifications stay saved on the server)
            useCartStore.getState().clearCart();
            useNotificationStore.getState().reset();

            set({ user: null, token: null, isAuthenticated: false });
        },
    }), {
        name: "auth-storage",
    })
)

export default useAuthStore;
